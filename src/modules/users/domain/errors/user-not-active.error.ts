import { DomainError } from "@shared-kernel/errors/domain.error";

export class UserNotActiveError extends DomainError {
    constructor(userId: string, currentStatus: string) {
        super(
            'USER_NOT_ACTIVE',
            `El usuario ${userId} no está activo. Estado actual: ${currentStatus}`,
            403
        );
        this.name = 'UserNotActiveError';
    }
}