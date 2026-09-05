import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import type { ISessionRepository } from "@auth-domain/repositories/session.repository.interface";
import type { ITokenService } from "@auth-domain/ports/token.service.interface";
import type { ITokenGenerator } from "@auth-domain/ports/token-generator.interface";
import type { IRateLimiter } from "@auth-domain/ports/rate-limiter.interface";
import type { IDeviceInfoParser } from "@auth-domain/ports/device-info-parser.interface";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";
import type { IHashService } from "@shared-domain/ports/hash-service";
import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";

import { SessionEntity } from "@auth-domain/entities/session.entity";
import { DeviceInfoVO } from "@auth-domain/value-objects/device-info.vo";
import { RefreshTokenVO } from "@auth-domain/value-objects/refresh-token.vo";
import { AuthPolicy } from "@auth-domain/constants/auth-policy";

import { InvalidCredentialsError } from "@auth-application/errors/invalid-credentials.error";
import { AccountBlockedError } from "@auth-application/errors/account-blocked.error";

import type { LoginDto } from "@auth-application/dtos/login.dto";
import type { LoginResponseDto } from "@auth-application/dtos/login-response.dto";
import { RefreshTokenHashVO } from "@auth-domain/value-objects/refresh-token-hash.vo";

const DUMMY_PASSWORD_HASH = '$2b$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01';

@injectable()
export class LoginUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository,
        @inject(TYPES.SessionRepository)
        private readonly sessionRepository: ISessionRepository,
        @inject(TYPES.TokenService)
        private readonly tokenService: ITokenService,
        @inject(TYPES.TokenGenerator)
        private readonly tokenGenerator: ITokenGenerator,
        @inject(TYPES.PasswordHasher)
        private readonly passwordHasher: IPasswordHasher,
        @inject(TYPES.RateLimiter)
        private readonly rateLimiter: IRateLimiter,
        @inject(TYPES.DeviceInfoParser)
        private readonly deviceInfoParser: IDeviceInfoParser,
        @inject(TYPES.HashService)
        private readonly hashService: IHashService,
        @inject(TYPES.EntityIdGenerator)
        private readonly idGenerator: IEntityIdGenerator,
    ) { }

    async execute(dto: LoginDto): Promise<Result<LoginResponseDto, AppError>> {
        const rateLimitStatus = await this.rateLimiter.checkLimit(dto.email);
        if (rateLimitStatus.isBlocked) {
            return Result.fail(new AccountBlockedError(rateLimitStatus.retryAfterSeconds));
        }

        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            await this.passwordHasher.compare(dto.password, DUMMY_PASSWORD_HASH);
            await this.rateLimiter.recordFailedAttempt(dto.email);
            return Result.fail(new InvalidCredentialsError());
        }

        const canLogin = user.ensureCanLogin();
        if (canLogin.isErr()) {
            await this.passwordHasher.compare(dto.password, DUMMY_PASSWORD_HASH);
            await this.rateLimiter.recordFailedAttempt(dto.email);
            return Result.fail(new InvalidCredentialsError());
        }

        const passwordMatches = await user.verifyPassword(dto.password, this.passwordHasher);
        if (!passwordMatches) {
            await this.rateLimiter.recordFailedAttempt(dto.email);
            return Result.fail(new InvalidCredentialsError());
        }

        const deviceName = this.deviceInfoParser.parse(dto.userAgent);
        const deviceInfoResult = DeviceInfoVO.create({
            deviceName,
            ip: dto.ip,
            userAgent: dto.userAgent,
        });
        if (deviceInfoResult.isErr()) {
            return Result.fail(deviceInfoResult.error());
        }

        const rawRefreshToken = this.tokenGenerator.generate();
        const refreshTokenResult = RefreshTokenVO.create(rawRefreshToken);
        if (refreshTokenResult.isErr()) {
            return Result.fail(refreshTokenResult.error());
        }

        const rawRefreshTokenHash = this.hashService.hash(refreshTokenResult.value().getValue());

        const refreshTokenHashResult = RefreshTokenHashVO.create(rawRefreshTokenHash);
        if (refreshTokenHashResult.isErr()) {
            return Result.fail(refreshTokenHashResult.error());
        }

        const sessionId = this.idGenerator.generate();
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + AuthPolicy.REFRESH_TOKEN_TTL_DAYS);

        const sessionResult = SessionEntity.create({
            sessionId,
            userId: user.getId(),
            deviceInfo: deviceInfoResult.value(),
            refreshTokenHash: refreshTokenHashResult.value(),
            createdAt: now,
            expiresAt,
        });
        if (sessionResult.isErr()) {
            return Result.fail(sessionResult.error());
        }

        const session = sessionResult.value();

        const accessToken = this.tokenService.generateAccessToken({
            id: user.getId(),
            email: user.getEmail(),
            role: user.getRoleName(),
            sessionId: session.getSessionId(),
        });

        await this.sessionRepository.save(session);
        await this.rateLimiter.resetAttempts(dto.email);

        return Result.ok({
            accessToken,
            refreshToken: refreshTokenResult.value().getValue(),
            sessionId: session.getSessionId(),
            expiresAt: session.getExpiresAt(),
            user: {
                id: user.getId(),
                email: user.getEmail(),
                role: user.getRoleName(),
            },
        });
    }
}