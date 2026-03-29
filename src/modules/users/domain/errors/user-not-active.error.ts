import { DomainError } from "@shared-kernel/errors/domain.error";

export class UserNotActiveError extends DomainError {
    constructor(userId: string) {
        super('USER_NOT_ACTIVE', `El usuario con ID ${userId} no está activo y no puede realizar esta acción.`, 400);
        this.name = 'UserNotActiveError';
    }
}
