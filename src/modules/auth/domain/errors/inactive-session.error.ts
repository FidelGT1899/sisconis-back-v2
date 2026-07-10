import { DomainError } from "@shared-kernel/errors/domain.error";

export class InactiveSessionError extends DomainError {
    constructor() {
        super(
            'INACTIVE_SESSION',
            'No se puede operar sobre una sesión inactiva.',
            409
        );
        this.name = 'InactiveSessionError';
    }
}
