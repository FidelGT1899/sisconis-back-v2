import { ApplicationError } from '@shared-kernel/errors/application.error';

export class InvalidRoleStatus extends ApplicationError {
    constructor() {
        super('INVALID_ROLE_STATUS', 'No se puede asignar un rol en estado pendiente o inactivo', 400);
        this.name = 'InvalidRoleStatus';
    }
}
