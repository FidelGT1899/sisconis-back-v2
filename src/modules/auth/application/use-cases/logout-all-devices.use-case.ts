import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { ISessionRepository } from "@auth-domain/repositories/session.repository.interface";

import type { LogoutAllDevicesDto } from "@auth-application/dtos/logout-all-devices.dto";

@injectable()
export class LogoutAllDevicesUseCase {
    constructor(
        @inject(TYPES.SessionRepository)
        private readonly sessionRepository: ISessionRepository,
    ) { }

    async execute(dto: LogoutAllDevicesDto): Promise<Result<void, AppError>> {
        // TODO: al llegar la fase de auditoría/telemetría, registrar aquí si
        // revokeAllByUserId no pudo revocar todas las sesiones esperadas
        // (ej. fallo parcial en Redis a mitad de operación bulk). Como esta
        // operación bypassa SessionEntity.revoke(), no hay forma de detectar
        // ni reportar ese escenario desde el dominio — la garantía de
        // consistencia depende 100% de la implementación de infraestructura.
        await this.sessionRepository.revokeAllByUserId(dto.userId, 'USER_REQUESTED');

        return Result.ok(undefined);
    }
}