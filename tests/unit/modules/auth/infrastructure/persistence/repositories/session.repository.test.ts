import { mock } from 'jest-mock-extended';
import type { Redis } from 'ioredis';

import { RedisSessionRepository } from '@auth-infrastructure/persistence/repositories/session.repository';
import type { RedisService } from '@shared-infrastructure/database/redis/redis.service';
import { SessionEntity } from '@auth-domain/entities/session.entity';
import { DeviceInfoVO } from '@auth-domain/value-objects/device-info.vo';
import { RefreshTokenHashVO } from '@auth-domain/value-objects/refresh-token-hash.vo';
import { sessionKey, userSessionsKey, blacklistKey } from '@auth-infrastructure/session-keys';
import { AuthPolicy } from '@auth-domain/constants/auth-policy';

const makeSession = (overrides: Partial<{
    sessionId: string;
    userId: string;
}> = {}) => {
    const deviceInfo = DeviceInfoVO.create({
        deviceName: 'Chrome on Windows',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
    }).value();

    const hash = RefreshTokenHashVO.create('a'.repeat(64)).value();

    const now = new Date('2026-06-15T12:00:00.000Z');
    const expiresAt = new Date('2026-12-31T23:59:59.000Z');

    return SessionEntity.create({
        sessionId: overrides.sessionId ?? 'session-123',
        userId: overrides.userId ?? 'user-123',
        deviceInfo,
        refreshTokenHash: hash,
        createdAt: now,
        expiresAt,
    }).value();
};

describe('RedisSessionRepository', () => {
    let repository: RedisSessionRepository;
    let mockRedis: ReturnType<typeof mock<Redis>>;
    let mockRedisService: ReturnType<typeof mock<RedisService>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRedis = mock<Redis>();
        mockRedisService = mock<RedisService>();
        mockRedisService.getClient.mockReturnValue(mockRedis);
        repository = new RedisSessionRepository(mockRedisService);
    });

    describe('save', () => {
        it('should save session to redis with correct keys and ttl', async () => {
            const session = makeSession();
            const mockMulti = {
                set: jest.fn().mockReturnThis(),
                sadd: jest.fn().mockReturnThis(),
                expire: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            };
            mockRedis.multi.mockReturnValue(mockMulti as never);

            await repository.save(session);

            expect(mockRedis.multi).toHaveBeenCalled();
            expect(mockMulti.set).toHaveBeenCalledWith(
                sessionKey('session-123'),
                expect.any(String),
                'EX',
                expect.any(Number)
            );
            expect(mockMulti.sadd).toHaveBeenCalledWith(
                userSessionsKey('user-123'),
                'session-123'
            );
            expect(mockMulti.expire).toHaveBeenCalledWith(
                userSessionsKey('user-123'),
                AuthPolicy.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60
            );
            expect(mockMulti.exec).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return SessionEntity when found', async () => {
            const session = makeSession();
            const primitives = session.toPrimitives();
            mockRedis.get.mockResolvedValue(JSON.stringify(primitives));

            const result = await repository.findById('session-123');

            expect(result).toBeInstanceOf(SessionEntity);
            expect(result?.getSessionId()).toBe('session-123');
            expect(mockRedis.get).toHaveBeenCalledWith(sessionKey('session-123'));
        });

        it('should return null when session does not exist', async () => {
            mockRedis.get.mockResolvedValue(null);

            const result = await repository.findById('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('findAllByUserId', () => {
        it('should return empty array when no sessions exist', async () => {
            mockRedis.smembers.mockResolvedValue([]);

            const result = await repository.findAllByUserId('user-123');

            expect(result).toEqual([]);
            expect(mockRedis.mget).not.toHaveBeenCalled();
        });

        it('should return sessions for user', async () => {
            const session = makeSession();
            const primitives = session.toPrimitives();

            mockRedis.smembers.mockResolvedValue(['session-123']);
            mockRedis.mget.mockResolvedValue([JSON.stringify(primitives)]);
            mockRedis.srem.mockResolvedValue(0);

            const result = await repository.findAllByUserId('user-123');

            expect(result).toHaveLength(1);
            expect(result[0]!.getSessionId()).toBe('session-123');
        });

        it('should clean stale session ids', async () => {
            mockRedis.smembers.mockResolvedValue(['session-123', 'stale-session']);
            mockRedis.mget.mockResolvedValue([null, null]);
            mockRedis.srem.mockResolvedValue(2);

            const result = await repository.findAllByUserId('user-123');

            expect(result).toEqual([]);
            expect(mockRedis.srem).toHaveBeenCalledWith(
                userSessionsKey('user-123'),
                'session-123',
                'stale-session'
            );
        });
    });

    describe('update', () => {
        it('should update active session with correct ttl', async () => {
            const session = makeSession();
            mockRedis.set.mockResolvedValue('OK');

            await repository.update(session);

            expect(mockRedis.set).toHaveBeenCalledWith(
                sessionKey('session-123'),
                expect.any(String),
                'EX',
                expect.any(Number)
            );
        });

        it('should update revoked session with short ttl', async () => {
            const session = makeSession();
            session.revoke();
            mockRedis.set.mockResolvedValue('OK');

            await repository.update(session);

            expect(mockRedis.set).toHaveBeenCalledWith(
                sessionKey('session-123'),
                expect.any(String),
                'EX',
                AuthPolicy.ACCESS_TOKEN_TTL_SECONDS
            );
        });
    });

    describe('revokeAllByUserId', () => {
        it('should do nothing when no sessions exist', async () => {
            mockRedis.smembers.mockResolvedValue([]);

            await repository.revokeAllByUserId('user-123', 'USER_REQUESTED');

            expect(mockRedis.mget).not.toHaveBeenCalled();
        });

        it('should revoke all active sessions and add to blacklist', async () => {
            const session = makeSession();
            const primitives = session.toPrimitives();

            mockRedis.smembers.mockResolvedValue(['session-123']);
            mockRedis.mget.mockResolvedValue([JSON.stringify(primitives)]);

            const mockMulti = {
                set: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            };
            mockRedis.multi.mockReturnValue(mockMulti as never);

            await repository.revokeAllByUserId('user-123', 'USER_REQUESTED');

            expect(mockMulti.set).toHaveBeenCalledWith(
                sessionKey('session-123'),
                expect.any(String),
                'EX',
                AuthPolicy.ACCESS_TOKEN_TTL_SECONDS
            );
            expect(mockMulti.set).toHaveBeenCalledWith(
                blacklistKey('session-123'),
                'USER_REQUESTED',
                'EX',
                AuthPolicy.ACCESS_TOKEN_TTL_SECONDS
            );
        });

        it('should skip already revoked sessions (idempotent)', async () => {
            const session = makeSession();
            session.revoke();
            const primitives = session.toPrimitives();

            mockRedis.smembers.mockResolvedValue(['session-123']);
            mockRedis.mget.mockResolvedValue([JSON.stringify(primitives)]);

            const mockMulti = {
                set: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            };
            mockRedis.multi.mockReturnValue(mockMulti as never);

            await repository.revokeAllByUserId('user-123', 'USER_REQUESTED');

            expect(mockMulti.set).not.toHaveBeenCalled();
        });
    });
});
