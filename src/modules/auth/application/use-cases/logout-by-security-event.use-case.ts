import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { ISessionRepository } from "@auth-domain/repositories/session.repository.interface";

import type { LogoutBySecurityEventDto } from "@auth-application/dtos/logout-by-security-event.dto";

@injectable()
export class LogoutBySecurityEventUseCase {
    constructor(
        @inject(TYPES.SessionRepository)
        private readonly sessionRepository: ISessionRepository,
    ) { }

    async execute(dto: LogoutBySecurityEventDto): Promise<Result<void, AppError>> {
        // TODO: mismo TODO de auditoría que LogoutAllDevicesUseCase — cuando
        // exista un AuditEventHandler basado en eventos de dominio, este es
        // el punto donde se emitiría un SessionsRevokedByEvent con el reason
        // recibido, en vez de simplemente ejecutar la revocación bulk.
        await this.sessionRepository.revokeAllByUserId(dto.userId, dto.reason);

        return Result.ok(undefined);
    }
}