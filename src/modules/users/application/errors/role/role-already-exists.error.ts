import { ApplicationError } from '@shared-kernel/errors/application.error';

export class RoleAlreadyExistsError extends ApplicationError {
    constructor(message: string) {
        super('ROLE_ALREADY_EXISTS', message, 409);
        this.name = 'RoleAlreadyExistsError';
    }
}
