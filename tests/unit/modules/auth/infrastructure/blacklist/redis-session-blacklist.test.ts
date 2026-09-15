import { mock } from 'jest-mock-extended';
import type { Redis } from 'ioredis';

import { RedisSessionBlacklist } from '@auth-infrastructure/blacklist/redis-session-blacklist';
import type { RedisService } from '@shared-infrastructure/database/redis/redis.service';
import { AuthPolicy } from '@auth-domain/constants/auth-policy';
import { blacklistKey } from '@auth-infrastructure/session-keys';

describe('RedisSessionBlacklist', () => {
    let blacklist: RedisSessionBlacklist;
    let mockRedis: ReturnType<typeof mock<Redis>>;
    let mockRedisService: ReturnType<typeof mock<RedisService>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRedis = mock<Redis>();
        mockRedisService = mock<RedisService>();
        mockRedisService.getClient.mockReturnValue(mockRedis);
        blacklist = new RedisSessionBlacklist(mockRedisService);
    });

    describe('blacklist', () => {
        it('should set blacklist key with reason and TTL', async () => {
            mockRedis.set.mockResolvedValue('OK');

            await blacklist.blacklist('session-123', 'USER_REQUESTED');

            expect(mockRedis.set).toHaveBeenCalledWith(
                blacklistKey('session-123'),
                'USER_REQUESTED',
                'EX',
                AuthPolicy.ACCESS_TOKEN_TTL_SECONDS
            );
        });

        it('should work with different revocation reasons', async () => {
            mockRedis.set.mockResolvedValue('OK');

            await blacklist.blacklist('session-456', 'SUSPICIOUS');

            expect(mockRedis.set).toHaveBeenCalledWith(
                blacklistKey('session-456'),
                'SUSPICIOUS',
                'EX',
                AuthPolicy.ACCESS_TOKEN_TTL_SECONDS
            );
        });
    });

    describe('isBlacklisted', () => {
        it('should return true when session is blacklisted', async () => {
            mockRedis.exists.mockResolvedValue(1);

            const result = await blacklist.isBlacklisted('session-123');

            expect(result).toBe(true);
            expect(mockRedis.exists).toHaveBeenCalledWith(blacklistKey('session-123'));
        });

        it('should return false when session is not blacklisted', async () => {
            mockRedis.exists.mockResolvedValue(0);

            const result = await blacklist.isBlacklisted('session-123');

            expect(result).toBe(false);
        });

        it('should return false when key does not exist', async () => {
            mockRedis.exists.mockResolvedValue(0);

            const result = await blacklist.isBlacklisted('non-existent');

            expect(result).toBe(false);
        });
    });
});
