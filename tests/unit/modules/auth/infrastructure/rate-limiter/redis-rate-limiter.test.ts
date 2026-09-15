import { mock } from 'jest-mock-extended';
import type { Redis } from 'ioredis';

import { RedisRateLimiter } from '@auth-infrastructure/rate-limiter/redis-rate-limiter';
import type { RedisService } from '@shared-infrastructure/database/redis/redis.service';
import { AuthPolicy } from '@auth-domain/constants/auth-policy';

const attemptsKey = (id: string) => `login_attempts:${id}`;
const lockoutKey = (id: string) => `login_lockout:${id}`;
const accountLockedKey = (id: string) => `account_locked:${id}`;

describe('RedisRateLimiter', () => {
    let rateLimiter: RedisRateLimiter;
    let mockRedis: ReturnType<typeof mock<Redis>>;
    let mockRedisService: ReturnType<typeof mock<RedisService>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRedis = mock<Redis>();
        mockRedisService = mock<RedisService>();
        mockRedisService.getClient.mockReturnValue(mockRedis);
        rateLimiter = new RedisRateLimiter(mockRedisService);
    });

    describe('checkLimit', () => {
        it('should return not blocked with full attempts when no data exists', async () => {
            mockRedis.exists.mockResolvedValue(0);
            mockRedis.ttl.mockResolvedValue(-2);
            mockRedis.get.mockResolvedValue(null);

            const result = await rateLimiter.checkLimit('user@test.com');

            expect(mockRedis.exists).toHaveBeenCalledWith(accountLockedKey('user@test.com'));
            expect(mockRedis.ttl).toHaveBeenCalledWith(lockoutKey('user@test.com'));
            expect(mockRedis.get).toHaveBeenCalledWith(attemptsKey('user@test.com'));
            expect(result.isBlocked).toBe(false);
            expect(result.remainingAttempts).toBe(AuthPolicy.MAX_FAILED_ATTEMPTS_TIER1);
            expect(result.retryAfterSeconds).toBeNull();
        });

        it('should return blocked when account is permanently locked', async () => {
            mockRedis.exists.mockResolvedValue(1);

            const result = await rateLimiter.checkLimit('user@test.com');

            expect(mockRedis.exists).toHaveBeenCalledWith(accountLockedKey('user@test.com'));
            expect(mockRedis.ttl).not.toHaveBeenCalled();
            expect(mockRedis.get).not.toHaveBeenCalled();
            expect(result.isBlocked).toBe(true);
            expect(result.remainingAttempts).toBe(0);
            expect(result.retryAfterSeconds).toBeNull();
        });

        it('should return blocked with retryAfter when lockout is active', async () => {
            mockRedis.exists.mockResolvedValue(0);
            mockRedis.ttl.mockResolvedValue(600);

            const result = await rateLimiter.checkLimit('user@test.com');

            expect(mockRedis.exists).toHaveBeenCalledWith(accountLockedKey('user@test.com'));
            expect(mockRedis.ttl).toHaveBeenCalledWith(lockoutKey('user@test.com'));
            expect(mockRedis.get).not.toHaveBeenCalled();
            expect(result.isBlocked).toBe(true);
            expect(result.remainingAttempts).toBe(0);
            expect(result.retryAfterSeconds).toBe(600);
        });

        it('should calculate remaining attempts based on current count', async () => {
            mockRedis.exists.mockResolvedValue(0);
            mockRedis.ttl.mockResolvedValue(-2);
            mockRedis.get.mockResolvedValue('3');

            const result = await rateLimiter.checkLimit('user@test.com');

            expect(mockRedis.exists).toHaveBeenCalledWith(accountLockedKey('user@test.com'));
            expect(mockRedis.ttl).toHaveBeenCalledWith(lockoutKey('user@test.com'));
            expect(mockRedis.get).toHaveBeenCalledWith(attemptsKey('user@test.com'));
            expect(result.isBlocked).toBe(false);
            expect(result.remainingAttempts).toBe(AuthPolicy.MAX_FAILED_ATTEMPTS_TIER1 - 3);
        });
    });

    describe('recordFailedAttempt', () => {
        it('should increment attempt counter', async () => {
            mockRedis.incr.mockResolvedValue(1);
            mockRedis.expire.mockResolvedValue(1);

            await rateLimiter.recordFailedAttempt('user@test.com');

            expect(mockRedis.incr).toHaveBeenCalledWith(attemptsKey('user@test.com'));
            expect(mockRedis.expire).toHaveBeenCalledWith(
                attemptsKey('user@test.com'),
                AuthPolicy.ATTEMPTS_HOUSEKEEPING_TTL_HOURS * 60 * 60
            );
        });

        it('should set lockout at tier 1 threshold', async () => {
            mockRedis.incr.mockResolvedValue(AuthPolicy.MAX_FAILED_ATTEMPTS_TIER1);
            mockRedis.expire.mockResolvedValue(1);
            mockRedis.set.mockResolvedValue('OK');

            await rateLimiter.recordFailedAttempt('user@test.com');

            expect(mockRedis.set).toHaveBeenCalledWith(
                lockoutKey('user@test.com'),
                'LOCKED_OUT',
                'EX',
                AuthPolicy.LOCKOUT_DURATION_TIER1_MINUTES * 60
            );
        });

        it('should set lockout at tier 2 threshold', async () => {
            mockRedis.incr.mockResolvedValue(AuthPolicy.MAX_FAILED_ATTEMPTS_TIER2);
            mockRedis.expire.mockResolvedValue(1);
            mockRedis.set.mockResolvedValue('OK');

            await rateLimiter.recordFailedAttempt('user@test.com');

            expect(mockRedis.set).toHaveBeenCalledWith(
                lockoutKey('user@test.com'),
                'LOCKED_OUT',
                'EX',
                AuthPolicy.LOCKOUT_DURATION_TIER2_MINUTES * 60
            );
        });

        it('should permanently lock at tier 3 threshold', async () => {
            mockRedis.incr.mockResolvedValue(AuthPolicy.MAX_FAILED_ATTEMPTS_TIER3);
            mockRedis.expire.mockResolvedValue(1);
            mockRedis.set.mockResolvedValue('OK');

            await rateLimiter.recordFailedAttempt('user@test.com');

            expect(mockRedis.set).toHaveBeenCalledWith(
                accountLockedKey('user@test.com'),
                'PERMANENTLY_LOCKED'
            );
        });
    });

    describe('resetAttempts', () => {
        it('should delete attempts and lockout keys', async () => {
            mockRedis.del.mockResolvedValue(2);

            await rateLimiter.resetAttempts('user@test.com');

            expect(mockRedis.del).toHaveBeenCalledWith(
                attemptsKey('user@test.com'),
                lockoutKey('user@test.com')
            );
        });
    });
});
