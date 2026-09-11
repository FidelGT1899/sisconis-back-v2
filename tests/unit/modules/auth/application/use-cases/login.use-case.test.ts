import { mock } from 'jest-mock-extended';

import { LoginUseCase } from '@auth-application/use-cases/login.use-case';
import { InvalidCredentialsError } from '@auth-application/errors/invalid-credentials.error';
import { AccountBlockedError } from '@auth-application/errors/account-blocked.error';
import type { IUserRepository } from '@users-domain/repositories/user.repository.interface';
import type { ISessionRepository } from '@auth-domain/repositories/session.repository.interface';
import type { ITokenService } from '@auth-domain/ports/token.service.interface';
import type { ITokenGenerator } from '@auth-domain/ports/token-generator.interface';
import type { IRateLimiter } from '@auth-domain/ports/rate-limiter.interface';
import type { IDeviceInfoParser } from '@auth-domain/ports/device-info-parser.interface';
import type { IPasswordHasher } from '@shared-domain/ports/password-hasher';
import type { IHashService } from '@shared-domain/ports/hash-service';
import type { IEntityIdGenerator } from '@shared-domain/ports/id-generator';

import { makeUserEntity } from '@tests-factories/users/user.factory';

const loginDto = {
    email: 'john.doe@example.com',
    password: 'Secret123',
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test Browser)',
};

describe('LoginUseCase', () => {
    let useCase: LoginUseCase;
    let mockUserRepository: ReturnType<typeof mock<IUserRepository>>;
    let mockSessionRepository: ReturnType<typeof mock<ISessionRepository>>;
    let mockTokenService: ReturnType<typeof mock<ITokenService>>;
    let mockTokenGenerator: ReturnType<typeof mock<ITokenGenerator>>;
    let mockPasswordHasher: ReturnType<typeof mock<IPasswordHasher>>;
    let mockRateLimiter: ReturnType<typeof mock<IRateLimiter>>;
    let mockDeviceInfoParser: ReturnType<typeof mock<IDeviceInfoParser>>;
    let mockHashService: ReturnType<typeof mock<IHashService>>;
    let mockIdGenerator: ReturnType<typeof mock<IEntityIdGenerator>>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockUserRepository = mock<IUserRepository>();
        mockSessionRepository = mock<ISessionRepository>();
        mockTokenService = mock<ITokenService>();
        mockTokenGenerator = mock<ITokenGenerator>();
        mockPasswordHasher = mock<IPasswordHasher>();
        mockRateLimiter = mock<IRateLimiter>();
        mockDeviceInfoParser = mock<IDeviceInfoParser>();
        mockHashService = mock<IHashService>();
        mockIdGenerator = mock<IEntityIdGenerator>();

        mockRateLimiter.checkLimit.mockResolvedValue({
            isBlocked: false,
            remainingAttempts: 5,
            retryAfterSeconds: null,
        });
        mockDeviceInfoParser.parse.mockReturnValue('Test Device');
        mockTokenGenerator.generate.mockReturnValue(
            'a'.repeat(64)
        );
        mockHashService.hash.mockReturnValue('hashed-refresh-token-value');
        mockIdGenerator.generate.mockReturnValue('session-id-123');
        mockTokenService.generateAccessToken.mockReturnValue('jwt-access-token');
        mockSessionRepository.save.mockResolvedValue(undefined);
        mockRateLimiter.resetAttempts.mockResolvedValue(undefined);

        useCase = new LoginUseCase(
            mockUserRepository,
            mockSessionRepository,
            mockTokenService,
            mockTokenGenerator,
            mockPasswordHasher,
            mockRateLimiter,
            mockDeviceInfoParser,
            mockHashService,
            mockIdGenerator,
        );
    });

    it('should login successfully with valid credentials', async () => {
        const user = makeUserEntity();
        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockPasswordHasher.compare.mockResolvedValue(true);

        const result = await useCase.execute(loginDto);

        expect(result.isOk()).toBe(true);
        expect(result.value()).toHaveProperty('accessToken');
        expect(result.value()).toHaveProperty('refreshToken');
        expect(result.value()).toHaveProperty('sessionId');
        expect(result.value().user.email).toBe(loginDto.email);
        expect(mockSessionRepository.save).toHaveBeenCalledTimes(1);
        expect(mockRateLimiter.resetAttempts).toHaveBeenCalledWith(loginDto.email);
    });

    it('should return AccountBlockedError when rate limited', async () => {
        mockRateLimiter.checkLimit.mockResolvedValue({
            isBlocked: true,
            remainingAttempts: 0,
            retryAfterSeconds: 900,
        });

        const result = await useCase.execute(loginDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(AccountBlockedError);
        expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should return InvalidCredentialsError when user not found', async () => {
        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockPasswordHasher.compare.mockResolvedValue(false);

        const result = await useCase.execute(loginDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidCredentialsError);
        expect(mockPasswordHasher.compare).toHaveBeenCalled();
        expect(mockRateLimiter.recordFailedAttempt).toHaveBeenCalledWith(loginDto.email);
        expect(mockSessionRepository.save).not.toHaveBeenCalled();
    });

    it('should return InvalidCredentialsError when user cannot login (inactive)', async () => {
        const user = makeUserEntity({ status: 'SUSPENDED' as never });
        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockPasswordHasher.compare.mockResolvedValue(false);

        const result = await useCase.execute(loginDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidCredentialsError);
        expect(mockRateLimiter.recordFailedAttempt).toHaveBeenCalledWith(loginDto.email);
    });

    it('should return InvalidCredentialsError when password is wrong', async () => {
        const user = makeUserEntity();
        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockPasswordHasher.compare.mockResolvedValue(false);

        const result = await useCase.execute(loginDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidCredentialsError);
        expect(mockRateLimiter.recordFailedAttempt).toHaveBeenCalledWith(loginDto.email);
        expect(mockSessionRepository.save).not.toHaveBeenCalled();
    });

    it('should generate access token with correct payload', async () => {
        const user = makeUserEntity({ id: 'user-456', email: 'test@example.com' });
        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockPasswordHasher.compare.mockResolvedValue(true);

        await useCase.execute(loginDto);

        expect(mockTokenService.generateAccessToken).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'user-456',
                email: 'test@example.com',
            })
        );
    });

    it('should not save session or reset attempts when credentials fail', async () => {
        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockPasswordHasher.compare.mockResolvedValue(false);

        await useCase.execute(loginDto);

        expect(mockSessionRepository.save).not.toHaveBeenCalled();
        expect(mockRateLimiter.resetAttempts).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
        mockUserRepository.findByEmail.mockRejectedValue(new Error('DB down'));

        await expect(useCase.execute(loginDto)).rejects.toThrow('DB down');
    });
});
