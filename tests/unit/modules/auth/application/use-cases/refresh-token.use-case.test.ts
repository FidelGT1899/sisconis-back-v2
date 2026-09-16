import { mock } from 'jest-mock-extended';

import { RefreshTokenUseCase } from '@auth-application/use-cases/refresh-token.use-case';
import { SessionNotFoundError } from '@auth-application/errors/session-not-found.error';
import { InactiveSessionError } from '@auth-domain/errors/inactive-session.error';
import { RefreshTokenReuseDetectedError } from '@auth-domain/errors/refresh-token-reuse-detected.error';
import { InvalidRefreshTokenHashError } from '@auth-domain/errors/invalid-refresh-token-hash.error';
import type { IUserRepository } from '@users-domain/repositories/user.repository.interface';
import type { ISessionRepository } from '@auth-domain/repositories/session.repository.interface';
import type { ITokenService } from '@auth-domain/ports/token.service.interface';
import type { ITokenGenerator } from '@auth-domain/ports/token-generator.interface';
import type { IHashService } from '@shared-domain/ports/hash-service';
import { SessionEntity } from '@auth-domain/entities/session.entity';
import { DeviceInfoVO } from '@auth-domain/value-objects/device-info.vo';
import { RefreshTokenHashVO } from '@auth-domain/value-objects/refresh-token-hash.vo';
import { makeUserEntity } from '@tests-factories/users/user.factory';

const hashOf = (rawRefreshToken: string): string => `sha256:${rawRefreshToken}`;

// El hash almacenado es SIEMPRE distinto del token crudo, para que solo un
// flujo que realmente hashee el token entrante pueda dar match.
const validRefreshToken = 'a'.repeat(64);
const SESSION_HASH = hashOf(validRefreshToken);

const createValidSession = (overrides: Partial<{
    sessionId: string;
    userId: string;
}> = {}) => {
    const deviceInfo = DeviceInfoVO.create({
        deviceName: 'Test Device',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
    }).value();

    const hash = RefreshTokenHashVO.create(SESSION_HASH).value();

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

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = mock<IUserRepository>();
        mockSessionRepository = mock<ISessionRepository>();
        mockTokenService = mock<ITokenService>();
        mockTokenGenerator = mock<ITokenGenerator>();
        mockHashService = mock<IHashService>();

        // Hash dependiente del input: si producción dejara de hashear el token
        // entrante (comparando crudo contra el hash almacenado), los tests fallarían.
        mockHashService.hash.mockImplementation(value => hashOf(value));
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
        mockUserRepository.findById.mockResolvedValue(
            makeUserEntity({ id: 'user-123', email: 'test@test.com' })
        );

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: validRefreshToken,
        });

        expect(result.isOk()).toBe(true);
        expect(result.value().accessToken).toBe('new-access-token');
        expect(result.value().refreshToken).toBe('b'.repeat(64));
        expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith({
            id: 'user-123',
            email: 'test@test.com',
            role: 'Admin',
            sessionId: 'session-123',
        });
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
        const hash = RefreshTokenHashVO.create(SESSION_HASH).value();
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

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: validRefreshToken,
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InactiveSessionError);
    });

    it('should detect refresh token reuse and revoke all sessions', async () => {
        const session = createValidSession();
        const newHash = RefreshTokenHashVO.create(hashOf('c'.repeat(64))).value();
        session.rotateRefreshToken(newHash);

        mockSessionRepository.findById.mockResolvedValue(session);
        mockSessionRepository.revokeAllByUserId.mockResolvedValue(undefined);

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: validRefreshToken,
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(RefreshTokenReuseDetectedError);
        expect(mockSessionRepository.revokeAllByUserId).toHaveBeenCalledWith(
            'user-123',
            'SUSPICIOUS'
        );
    });

    it('should return SessionNotFoundError when the session user no longer exists', async () => {
        const session = createValidSession();
        mockSessionRepository.findById.mockResolvedValue(session);
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: validRefreshToken,
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(SessionNotFoundError);
        expect(mockSessionRepository.update).not.toHaveBeenCalled();
    });

    it('should return error when hash of refresh token does not match', async () => {
        const session = createValidSession();
        mockSessionRepository.findById.mockResolvedValue(session);

        const result = await useCase.execute({
            sessionId: 'session-123',
            refreshToken: 'z'.repeat(64),
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidRefreshTokenHashError);
    });

    it('should propagate repository errors', async () => {
        mockSessionRepository.findById.mockRejectedValue(new Error('Redis error'));

        await expect(
            useCase.execute({ sessionId: 'session-123', refreshToken: validRefreshToken })
        ).rejects.toThrow('Redis error');
    });
});
