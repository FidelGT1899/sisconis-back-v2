import { DomainError } from "@shared-kernel/errors/domain.error";

export class InvalidPasswordError extends DomainError {
    constructor() {
        super('INVALID_PASSWORD', 'La contraseña no cumple con los requisitos de seguridad.', 400);
        this.name = 'InvalidPasswordError';
    }
}
