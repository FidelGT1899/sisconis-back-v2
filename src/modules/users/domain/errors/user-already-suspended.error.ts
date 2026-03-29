import { DomainError } from "@shared-kernel/errors/domain.error";

export class UserAlreadySuspendedError extends DomainError {
    constructor(userId: string) {
        super('USER_ALREADY_SUSPENDED', `El usuario con ID ${userId} ya está suspendido.`, 400);
        this.name = 'UserAlreadySuspendedError';
    }
}
