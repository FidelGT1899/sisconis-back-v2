import { DomainError } from "@shared-kernel/errors/domain.error";

export class InvalidEmailError extends DomainError {
    constructor(email: string) {
        super(`El formato del correo electrónico '${email}' es inválido.`, 400);
        this.name = 'InvalidEmailError';
    }
}