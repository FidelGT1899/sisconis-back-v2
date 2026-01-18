import { DomainError } from "@shared-kernel/errors/domain.error";

export class InvalidDniError extends DomainError {
    constructor(value: string) {
        super('INVALID_DNI', `El DNI ingresado no es válido: ${value}. Debe tener 8 dígitos numéricos.`, 400);
        this.name = 'InvalidDniError';
    }
}
