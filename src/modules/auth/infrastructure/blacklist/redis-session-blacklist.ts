import type { Redis } from "ioredis";
import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { AuthPolicy } from "@auth-domain/constants/auth-policy";
import type { IAccessTokenBlacklist } from "@auth-domain/ports/access-token-blacklist.interface";
import type { RevocationReason } from "@auth-domain/repositories/session.repository.interface";
import { blacklistKey } from "@auth-infrastructure/session-keys";
import type { RedisService } from "@shared-infrastructure/database/redis/redis.service";

@injectable()
export class RedisSessionBlacklist implements IAccessTokenBlacklist {
    private readonly redis: Redis;

    constructor(
        @inject(TYPES.RedisService)
        private readonly redisService: RedisService,
    ) {
        this.redis = this.redisService.getClient();
    }

    // El valor guardado es el propio `reason` (no un flag genérico), así
    // que consultar esta key en Redis directamente ya es autoexplicativo.
    public async blacklist(sessionId: string, reason: RevocationReason): Promise<void> {
        await this.redis.set(
            blacklistKey(sessionId),
            reason,
            'EX',
            AuthPolicy.ACCESS_TOKEN_TTL_SECONDS,
        );
    }

    public async isBlacklisted(sessionId: string): Promise<boolean> {
        const exists = await this.redis.exists(blacklistKey(sessionId));
        return exists === 1;
    }
}