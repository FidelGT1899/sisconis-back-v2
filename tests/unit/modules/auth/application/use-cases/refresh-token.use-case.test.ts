import { mock } from 'jest-mock-extended';

import { RefreshTokenUseCase } from '@auth-application/use-cases/refresh-token.use-case';
import { SessionNotFoundError } from '@auth-application/errors/session-not-found.error';
import { InactiveSessionError } from '@auth-domain/errors/inactive-session.error';
import { RefreshTokenReuseDetectedError } from '@auth-domain/errors/refresh-token-reuse-detected.error';
import type { IUserRepository } from '@users-domain/repositories/user.repository.interface';
import type { ISessionRepository } from '@auth-domain/repositories/session.repository.interface';
import type { ITokenService } from '@auth-domain/ports/token.service.interface';
import type { ITokenGenerator } from '@auth-domain/ports/token-generator.interface';
import type { IHashService } from '@shared-domain/ports/hash-service';
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

describe('RefreshTokenUseCase', () => {
    let useCase: RefreshTokenUseCase;
    let mockUserRepository: ReturnType<typeof mock<IUserRepository>>;
    let mockSessionRepository: ReturnType<typeof mock<ISessionRepository>>;
    let mockTokenService: ReturnType<typeof mock<ITokenService>>;
    let mockTokenGenerator: ReturnType<typeof mock<ITokenGenerator>>;
    let mockHashService: ReturnType<typeof mock<IHashService>>;

    const validRefreshToken = 'a'.repeat(64);
    const SESSION_HASH = 'a'.repeat(64);

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = mock<IUserRepository>();
        mockSessionRepository = mock<ISessionRepository>();
        mockTokenService = mock<ITokenService>();
        mockTokenGenerator = mock<ITokenGenerator>();
        mockHashService = mock<IHashService>();

        mockTokenGenerator.generate.mockReturnValue('b'.repeat(64));
        mockTokenService.generateAccessToken.mockReturnValue('new-access-token');
        mockSessionRepository.update.mockResolvedValue(undefined);

        useCase = new RefreshTokenUseCase(
            mockUserRepository,
            mockSessionRepository,
            mockTokenService,
            mockTokenGenerator,
            mockHashService,
        );
    });

    it('should refresh token successfully', async () => {
        const session = createValidSession();
        mockSessionRepository.findById.mockResolvedValue(session);
        mockHashService.hash.mockReturnValue(SESSION_HASH);
        mockUserRepository.findById.mockResolvedValue(
            { getId: () => 'user-123', getEmail: () => 'test@test.com', getRoleName: () => 'Admin' } as never
        );

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: validRefreshToken,
        });

        expect(result.isOk()).toBe(true);
        expect(result.value()).toHaveProperty('accessToken');
        expect(result.value()).toHaveProperty('refreshToken');
        expect(mockSessionRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should return SessionNotFoundError when session not found', async () => {
        mockSessionRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({
            sessionId: 'non-existent',
            refreshToken: validRefreshToken,
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(SessionNotFoundError);
    });

    it('should return InactiveSessionError when session is revoked', async () => {
        const session = createValidSession();
        session.revoke();
        mockSessionRepository.findById.mockResolvedValue(session);
        mockHashService.hash.mockReturnValue(SESSION_HASH);

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: validRefreshToken,
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InactiveSessionError);
    });

    it('should return InactiveSessionError when session is expired', async () => {
        const deviceInfo = DeviceInfoVO.create({
            deviceName: 'Test', ip: '127.0.0.1', userAgent: 'Mozilla/5.0',
        }).value();
        const hash = RefreshTokenHashVO.create('a'.repeat(64)).value();
        const past = new Date('2020-01-01');
        const pastExpiry = new Date('2020-01-02');

        const session = SessionEntity.create({
            sessionId: 'session-123',
            userId: 'user-123',
            deviceInfo,
            refreshTokenHash: hash,
            createdAt: past,
            expiresAt: pastExpiry,
        }).value();

        mockSessionRepository.findById.mockResolvedValue(session);
        mockHashService.hash.mockReturnValue(SESSION_HASH);

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: validRefreshToken,
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InactiveSessionError);
    });

    it('should detect refresh token reuse and revoke all sessions', async () => {
        const session = createValidSession();
        const previousHash = RefreshTokenHashVO.create('c'.repeat(64)).value();
        session.rotateRefreshToken(previousHash);

        mockSessionRepository.findById.mockResolvedValue(session);
        mockSessionRepository.revokeAllByUserId.mockResolvedValue(undefined);
        mockHashService.hash.mockReturnValue('a'.repeat(64));

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: 'a'.repeat(64),
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(RefreshTokenReuseDetectedError);
        expect(mockSessionRepository.revokeAllByUserId).toHaveBeenCalledWith(
            'user-123',
            'SUSPICIOUS'
        );
    });

    it('should return error when hash of refresh token does not match', async () => {
        const session = createValidSession();
        mockSessionRepository.findById.mockResolvedValue(session);
        mockHashService.hash.mockReturnValue('z'.repeat(64));

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: 'z'.repeat(64),
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()?.code).toBe('INVALID_REFRESH_TOKEN_HASH');
    });

    it('should propagate repository errors', async () => {
        mockSessionRepository.findById.mockRejectedValue(new Error('Redis error'));

        await expect(
            useCase.execute({ sessionId: 'session-123', refreshToken: validRefreshToken })
        ).rejects.toThrow('Redis error');
    });
});
