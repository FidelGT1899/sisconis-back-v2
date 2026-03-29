import { ApplicationError } from '@shared-kernel/errors/application.error';

export class RoleHasUsersError extends ApplicationError {
    constructor(id: string) {
        super('ROLE_HAS_USERS', `El rol ${id} tiene usuarios asignados y no puede eliminarse`, 409);
        this.name = 'RoleHasUsersError';
    }
}
