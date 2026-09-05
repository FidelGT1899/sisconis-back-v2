import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import type { ISessionRepository } from "@auth-domain/repositories/session.repository.interface";
import type { ITokenService } from "@auth-domain/ports/token.service.interface";
import type { ITokenGenerator } from "@auth-domain/ports/token-generator.interface";
import type { IHashService } from "@shared-domain/ports/hash-service";

import { RefreshTokenVO } from "@auth-domain/value-objects/refresh-token.vo";
import { RefreshTokenHashVO } from "@auth-domain/value-objects/refresh-token-hash.vo";
import { InvalidRefreshTokenHashError } from "@auth-domain/errors/invalid-refresh-token-hash.error";
import { InactiveSessionError } from "@auth-domain/errors/inactive-session.error";
import { RefreshTokenReuseDetectedError } from "@auth-domain/errors/refresh-token-reuse-detected.error";

import { SessionNotFoundError } from "@auth-application/errors/session-not-found.error";

import type { RefreshTokenDto } from "@auth-application/dtos/refresh-token.dto";
import type { RefreshTokenResponseDto } from "@auth-application/dtos/refresh-token-response.dto";

@injectable()
export class RefreshTokenUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository,
        @inject(TYPES.SessionRepository)
        private readonly sessionRepository: ISessionRepository,
        @inject(TYPES.TokenService)
        private readonly tokenService: ITokenService,
        @inject(TYPES.TokenGenerator)
        private readonly tokenGenerator: ITokenGenerator,
        @inject(TYPES.HashService)
        private readonly hashService: IHashService,
    ) { }

    async execute(dto: RefreshTokenDto): Promise<Result<RefreshTokenResponseDto, AppError>> {
        const session = await this.sessionRepository.findById(dto.sessionId);
        if (!session) {
            return Result.fail(new SessionNotFoundError());
        }

        const incomingTokenResult = RefreshTokenVO.create(dto.refreshToken);
        if (incomingTokenResult.isErr()) {
            return Result.fail(incomingTokenResult.error());
        }

        const incomingHash = this.hashService.hash(incomingTokenResult.value().getValue());
        const incomingHashResult = RefreshTokenHashVO.create(incomingHash);
        if (incomingHashResult.isErr()) {
            return Result.fail(incomingHashResult.error());
        }
        const incomingHashVO = incomingHashResult.value();

        if (!session.isActive()) {
            return Result.fail(new InactiveSessionError());
        }

        if (session.matchesPreviousRefreshTokenHash(incomingHashVO)) {
            await this.sessionRepository.revokeAllByUserId(session.getUserId(), 'SUSPICIOUS');
            return Result.fail(new RefreshTokenReuseDetectedError());
        }

        if (!session.matchesRefreshTokenHash(incomingHashVO)) {
            return Result.fail(new InvalidRefreshTokenHashError());
        }

        const user = await this.userRepository.findById(session.getUserId());
        if (!user) {
            return Result.fail(new SessionNotFoundError());
        }

        const rawNewRefreshToken = this.tokenGenerator.generate();
        const newRefreshTokenResult = RefreshTokenVO.create(rawNewRefreshToken);
        if (newRefreshTokenResult.isErr()) {
            return Result.fail(newRefreshTokenResult.error());
        }

        const newHash = this.hashService.hash(newRefreshTokenResult.value().getValue());
        const newHashResult = RefreshTokenHashVO.create(newHash);
        if (newHashResult.isErr()) {
            return Result.fail(newHashResult.error());
        }

        const rotateResult = session.rotateRefreshToken(newHashResult.value());
        if (rotateResult.isErr()) {
            return Result.fail(rotateResult.error());
        }

        const accessToken = this.tokenService.generateAccessToken({
            id: user.getId(),
            email: user.getEmail(),
            role: user.getRoleName(),
            sessionId: session.getSessionId(),
        });

        await this.sessionRepository.update(session);

        return Result.ok({
            accessToken,
            refreshToken: newRefreshTokenResult.value().getValue(),
            expiresAt: session.getExpiresAt(),
        });
    }
}