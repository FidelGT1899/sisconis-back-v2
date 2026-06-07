import { DomainError } from "@shared-kernel/errors/domain.error";

export class InvalidSessionExpirationError extends DomainError {
    constructor(reason: 'past' | 'before-creation') {
        super(
            'INVALID_SESSION_EXPIRATION',
            reason === 'past'
                ? 'La nueva fecha de expiración debe ser en el futuro.'
                : 'La fecha de expiración debe ser posterior a la fecha de creación.',
            422
        );
        this.name = 'InvalidSessionExpirationError';
    }
}
