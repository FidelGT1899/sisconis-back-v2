import { ApplicationError } from '@shared-kernel/errors/application.error';

export class RoleActiveError extends ApplicationError {
    constructor(id: string) {
        super('ROLE_ACTIVE', `El rol ${id} está activo y no puede eliminarse`, 409);
        this.name = 'RoleActiveError';
    }
}
