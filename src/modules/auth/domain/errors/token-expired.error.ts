import { DomainError } from "@shared-kernel/errors/domain.error";

export class TokenExpiredError extends DomainError {
    constructor() {
        super('TOKEN_EXPIRED', 'El token de acceso ha expirado.', 401);
        this.name = 'TokenExpiredError';
    }
}