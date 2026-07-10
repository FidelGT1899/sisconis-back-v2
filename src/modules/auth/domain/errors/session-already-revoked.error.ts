import { DomainError } from "@shared-kernel/errors/domain.error";

export class SessionAlreadyRevokedError extends DomainError {
    constructor() {
        super(
            'SESSION_ALREADY_REVOKED',
            'La sesión ya fue revocada.',
            409
        );
        this.name = 'SessionAlreadyRevokedError';
    }
}
