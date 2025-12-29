import { ApplicationError } from "@shared-kernel/errors/application.error";

export class UserNotFoundError extends ApplicationError {
    constructor(id: string) {
        super('USER_NOT_FOUND', `User not found with id: ${id}`, 404);
        this.name = 'UserNotFoundError';
    }
}
