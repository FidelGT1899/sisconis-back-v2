import type { Redis } from "ioredis";
import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { AuthPolicy } from "@auth-domain/constants/auth-policy";
import type { IRateLimiter, RateLimitStatus } from "@auth-domain/ports/rate-limiter.interface";
import type { RedisService } from "@shared-infrastructure/database/redis/redis.service";

const attemptsKey = (identifier: string) => `login_attempts:${identifier}`;
const lockoutKey = (identifier: string) => `login_lockout:${identifier}`;
const accountLockedKey = (identifier: string) => `account_locked:${identifier}`;
const LOCKOUT_MARKER = 'LOCKED_OUT';           // tier 1/2, con TTL
const PERMANENT_LOCK_MARKER = 'PERMANENTLY_LOCKED'; // tier 3, sin TTL

@injectable()
export class RedisRateLimiter implements IRateLimiter {
    private readonly redis: Redis;

    constructor(
        @inject(TYPES.RedisService)
        redisService: RedisService,
    ) {
        this.redis = redisService.getClient();
    }

    public async checkLimit(identifier: string): Promise<RateLimitStatus> {
        const isPermanentlyLocked = await this.redis.exists(accountLockedKey(identifier));
        if (isPermanentlyLocked) {
            return { isBlocked: true, remainingAttempts: 0, retryAfterSeconds: null };
        }

        const lockoutTtl = await this.redis.ttl(lockoutKey(identifier));
        if (lockoutTtl > 0) {
            return { isBlocked: true, remainingAttempts: 0, retryAfterSeconds: lockoutTtl };
        }

        const rawCount = await this.redis.get(attemptsKey(identifier));
        const count = rawCount ? parseInt(rawCount, 10) : 0;

        const nextThreshold = this.getNextThreshold(count);
        const remainingAttempts = Math.max(nextThreshold - count, 0);

        return { isBlocked: false, remainingAttempts, retryAfterSeconds: null };
    }

    public async recordFailedAttempt(identifier: string): Promise<void> {
        const newCount = await this.redis.incr(attemptsKey(identifier));
        await this.redis.expire(attemptsKey(identifier), AuthPolicy.ATTEMPTS_HOUSEKEEPING_TTL_HOURS * 60 * 60);

        if (newCount === AuthPolicy.MAX_FAILED_ATTEMPTS_TIER3) {
            await this.redis.set(accountLockedKey(identifier), PERMANENT_LOCK_MARKER);
            return;
        }

        if (newCount === AuthPolicy.MAX_FAILED_ATTEMPTS_TIER2) {
            await this.redis.set(
                lockoutKey(identifier),
                LOCKOUT_MARKER,
                'EX',
                AuthPolicy.LOCKOUT_DURATION_TIER2_MINUTES * 60,
            );
            return;
        }

        if (newCount === AuthPolicy.MAX_FAILED_ATTEMPTS_TIER1) {
            await this.redis.set(
                lockoutKey(identifier),
                LOCKOUT_MARKER,
                'EX',
                AuthPolicy.LOCKOUT_DURATION_TIER1_MINUTES * 60,
            );
        }
    }

    /**
     * account_locked NUNCA se borra aquí a propósito — el tier 3 requiere
     * intervención manual de soporte, no se limpia con un login exitoso.
     */
    public async resetAttempts(identifier: string): Promise<void> {
        await this.redis.del(attemptsKey(identifier), lockoutKey(identifier));
    }

    private getNextThreshold(count: number): number {
        if (count < AuthPolicy.MAX_FAILED_ATTEMPTS_TIER1) {
            return AuthPolicy.MAX_FAILED_ATTEMPTS_TIER1;
        }
        if (count < AuthPolicy.MAX_FAILED_ATTEMPTS_TIER2) {
            return AuthPolicy.MAX_FAILED_ATTEMPTS_TIER2;
        }
        return AuthPolicy.MAX_FAILED_ATTEMPTS_TIER3;
    }
}