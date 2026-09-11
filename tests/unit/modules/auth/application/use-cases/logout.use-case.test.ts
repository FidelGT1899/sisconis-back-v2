import { mock } from 'jest-mock-extended';

import { LogoutUseCase } from '@auth-application/use-cases/logout.use-case';
import { SessionNotFoundError } from '@auth-application/errors/session-not-found.error';
import type { ISessionRepository } from '@auth-domain/repositories/session.repository.interface';
import type { IAccessTokenBlacklist } from '@auth-domain/ports/access-token-blacklist.interface';
import { SessionEntity } from '@auth-domain/entities/session.entity';
import { DeviceInfoVO } from '@auth-domain/value-objects/device-info.vo';
import { RefreshTokenHashVO } from '@auth-domain/value-objects/refresh-token-hash.vo';

const createValidSession = (overrides: Partial<{
    sessionId: string;
    userId: string;
}> = {}) => {
    const deviceInfo = DeviceInfoVO.create({
        deviceName: 'Test Device',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
    }).value();

    const hash = RefreshTokenHashVO.create('a'.repeat(64)).value();

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7);

    return SessionEntity.create({
        sessionId: overrides.sessionId ?? 'session-123',
        userId: overrides.userId ?? 'user-123',
        deviceInfo,
        refreshTokenHash: hash,
        createdAt: now,
        expiresAt,
    }).value();
};

describe('LogoutUseCase', () => {
    let useCase: LogoutUseCase;
    let mockSessionRepository: ReturnType<typeof mock<ISessionRepository>>;
    let mockAccessTokenBlacklist: ReturnType<typeof mock<IAccessTokenBlacklist>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSessionRepository = mock<ISessionRepository>();
        mockAccessTokenBlacklist = mock<IAccessTokenBlacklist>();
        useCase = new LogoutUseCase(mockSessionRepository, mockAccessTokenBlacklist);
    });

    it('should logout successfully', async () => {
        const session = createValidSession();
        mockSessionRepository.findById.mockResolvedValue(session);
        mockSessionRepository.update.mockResolvedValue(undefined);
        mockAccessTokenBlacklist.blacklist.mockResolvedValue(undefined);

        const result = await useCase.execute({
            sessionId: 'session-123',
            userId: 'user-123',
        });

        expect(result.isOk()).toBe(true);
        expect(mockSessionRepository.update).toHaveBeenCalledTimes(1);
        expect(mockAccessTokenBlacklist.blacklist).toHaveBeenCalledWith(
            'session-123',
            'USER_REQUESTED'
        );
    });

    it('should return SessionNotFoundError when session not found', async () => {
        mockSessionRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({
            sessionId: 'non-existent',
            userId: 'user-123',
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(SessionNotFoundError);
        expect(mockSessionRepository.update).not.toHaveBeenCalled();
    });

    it('should return SessionNotFoundError when session belongs to different user', async () => {
        const session = createValidSession({ userId: 'other-user' });
        mockSessionRepository.findById.mockResolvedValue(session);

        const result = await useCase.execute({
            sessionId: 'session-123',
            userId: 'user-123',
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(SessionNotFoundError);
    });

    it('should be idempotent when session is already revoked', async () => {
        const session = createValidSession();
        session.revoke();
        mockSessionRepository.findById.mockResolvedValue(session);

        const result = await useCase.execute({
            sessionId: 'session-123',
            userId: 'user-123',
        });

        expect(result.isOk()).toBe(true);
        expect(mockSessionRepository.update).not.toHaveBeenCalled();
        expect(mockAccessTokenBlacklist.blacklist).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
        mockSessionRepository.findById.mockRejectedValue(new Error('Redis down'));

        await expect(
            useCase.execute({ sessionId: 'session-123', userId: 'user-123' })
        ).rejects.toThrow('Redis down');
    });
});
