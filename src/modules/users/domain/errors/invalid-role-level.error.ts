import { DomainError } from "@shared-kernel/errors/domain.error";

export class InvalidRoleLevelError extends DomainError {
    constructor(level: number) {
        super(
            'INVALID_ROLE_LEVEL',
            `El nivel jerárquico '${level}' es inválido. Debe ser un número mayor a 0.`,
            400
        );
        this.name = 'InvalidRoleLevelError';
    }
}
