import type { Redis } from "ioredis";
import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { ttlSecondsUntil } from "@shared-kernel/utils/ttl.util";
import { AuthPolicy } from "@auth-domain/constants/auth-policy";
import { SessionEntity, type SessionPrimitives } from "@auth-domain/entities/session.entity";
import type { ISessionRepository, RevocationReason } from "@auth-domain/repositories/session.repository.interface";
import { sessionKey, userSessionsKey, blacklistKey } from "@auth-infrastructure/session-keys";
import type { RedisService } from "@shared-infrastructure/database/redis/redis.service";

function toStored(primitives: SessionPrimitives): string {
    return JSON.stringify(primitives); // Date -> string ISO automático
}

function fromStored(raw: string): SessionPrimitives {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
        ...parsed,
        createdAt: new Date(parsed.createdAt as string),
        updatedAt: new Date(parsed.updatedAt as string),
        expiresAt: new Date(parsed.expiresAt as string),
        revokedAt: parsed.revokedAt ? new Date(parsed.revokedAt as string) : null,
    } as SessionPrimitives;
}

@injectable()
export class RedisSessionRepository implements ISessionRepository {
    private readonly redis: Redis;

    constructor(
        @inject(TYPES.RedisService)
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getClient();
    }

    public async save(session: SessionEntity): Promise<void> {
        const primitives = session.toPrimitives();
        const ttl = ttlSecondsUntil(primitives.expiresAt);

        const multi = this.redis.multi();
        multi.set(sessionKey(primitives.sessionId), toStored(primitives), 'EX', ttl);
        multi.sadd(userSessionsKey(primitives.userId), primitives.sessionId);
        multi.expire(userSessionsKey(primitives.userId), AuthPolicy.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60);
        await multi.exec();
    }

    public async findById(sessionId: string): Promise<SessionEntity | null> {
        const raw = await this.redis.get(sessionKey(sessionId));
        if (!raw) {
            return null;
        }

        const result = SessionEntity.rehydrate(fromStored(raw));
        return result.isOk() ? result.value() : null;
    }

    public async findAllByUserId(userId: string): Promise<SessionEntity[]> {
        const sessionIds = await this.redis.smembers(userSessionsKey(userId));
        if (sessionIds.length === 0) return [];

        const rawSessions = await this.redis.mget(...sessionIds.map(sessionKey));
        const sessions: SessionEntity[] = [];
        const staleIds: string[] = [];

        rawSessions.forEach((raw, index) => {
            const sessionId = sessionIds[index];
            if (!sessionId) return;

            if (!raw) {
                staleIds.push(sessionId);
                return;
            }

            const result = SessionEntity.rehydrate(fromStored(raw));
            if (result.isOk()) {
                sessions.push(result.value());
            } else {
                staleIds.push(sessionId);
            }
        });

        if (staleIds.length > 0) {
            await this.redis.srem(userSessionsKey(userId), ...staleIds);
        }

        return sessions;
    }

    public async update(session: SessionEntity): Promise<void> {
        const primitives = session.toPrimitives();

        const ttl = session.isRevoked()
            ? AuthPolicy.ACCESS_TOKEN_TTL_SECONDS
            : ttlSecondsUntil(primitives.expiresAt);

        await this.redis.set(sessionKey(primitives.sessionId), toStored(primitives), 'EX', ttl);
    }

    public async revokeAllByUserId(userId: string, reason: RevocationReason): Promise<void> {
        const sessionIds = await this.redis.smembers(userSessionsKey(userId));
        if (sessionIds.length === 0) {
            return;
        }

        const rawSessions = await this.redis.mget(...sessionIds.map(sessionKey));
        const multi = this.redis.multi();
        const now = new Date();

        rawSessions.forEach((raw, index) => {
            const sessionId = sessionIds[index];
            if (!sessionId || !raw) return;

            const primitives = fromStored(raw);
            if (primitives.revokedAt !== null) return; // idempotente

            const updated: SessionPrimitives = { ...primitives, revokedAt: now, updatedAt: now };

            multi.set(sessionKey(sessionId), toStored(updated), 'EX', AuthPolicy.ACCESS_TOKEN_TTL_SECONDS);
            multi.set(blacklistKey(sessionId), reason, 'EX', AuthPolicy.ACCESS_TOKEN_TTL_SECONDS);
        });

        await multi.exec();
    }
}