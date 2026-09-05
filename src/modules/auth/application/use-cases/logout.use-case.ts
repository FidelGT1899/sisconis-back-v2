import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { ISessionRepository } from "@auth-domain/repositories/session.repository.interface";
import type { IAccessTokenBlacklist } from "@auth-domain/ports/access-token-blacklist.interface";

import { SessionNotFoundError } from "@auth-application/errors/session-not-found.error";

import type { LogoutDto } from "@auth-application/dtos/logout.dto";

@injectable()
export class LogoutUseCase {
    constructor(
        @inject(TYPES.SessionRepository)
        private readonly sessionRepository: ISessionRepository,
        @inject(TYPES.AccessTokenBlacklist)
        private readonly accessTokenBlacklist: IAccessTokenBlacklist,
    ) { }

    async execute(dto: LogoutDto): Promise<Result<void, AppError>> {
        const session = await this.sessionRepository.findById(dto.sessionId);

        if (!session || !session.belongsTo(dto.userId)) {
            return Result.fail(new SessionNotFoundError());
        }

        if (session.isRevoked()) {
            return Result.ok(undefined);
        }

        const revokeResult = session.revoke();
        if (revokeResult.isErr()) {
            return Result.fail(revokeResult.error());
        }

        await this.sessionRepository.update(session);
        await this.accessTokenBlacklist.blacklist(session.getSessionId(), 'USER_REQUESTED');

        return Result.ok(undefined);
    }
}