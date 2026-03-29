import { DomainError } from "@shared-kernel/errors/domain.error";

export class UserAlreadyInactiveError extends DomainError {
    constructor(userId: string) {
        super('USER_ALREADY_INACTIVE', `El usuario con ID ${userId} ya está inactivo.`, 400);
        this.name = 'UserAlreadyInactiveError';
    }
}
