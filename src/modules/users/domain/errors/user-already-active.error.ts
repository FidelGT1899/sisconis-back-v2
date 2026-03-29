import { DomainError } from "@shared-kernel/errors/domain.error";

export class UserAlreadyActiveError extends DomainError {
    constructor(userId: string) {
        super('USER_ALREADY_ACTIVE', `El usuario con ID ${userId} ya está activo.`, 400);
        this.name = 'UserAlreadyActiveError';
    }
}
