import { ApplicationError } from "@shared-kernel/errors/application.error";

export class RoleNotFoundError extends ApplicationError {
    constructor(id: string) {
        super('ROLE_NOT_FOUND', `Role not found with id: ${id}`, 404);
        this.name = 'RoleNotFoundError';
    }
}
