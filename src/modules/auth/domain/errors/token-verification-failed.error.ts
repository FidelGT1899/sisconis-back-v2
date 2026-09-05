import { DomainError } from "@shared-kernel/errors/domain.error";

export class TokenVerificationFailedError extends DomainError {
    constructor() {
        super('TOKEN_VERIFICATION_FAILED', 'El token de acceso es inválido.', 401);
        this.name = 'TokenVerificationFailedError';
    }
}