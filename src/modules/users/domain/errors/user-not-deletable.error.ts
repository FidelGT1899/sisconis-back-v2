import { DomainError } from "@shared-kernel/errors/domain.error";

export class UserNotDeletableError extends DomainError {
    constructor(userId: string) {
        super('USER_NOT_DELETABLE', `El usuario con ID ${userId} no se puede eliminar porque no está inactivo.`, 400);
        this.name = 'UserNotDeletableError';
    }
}
