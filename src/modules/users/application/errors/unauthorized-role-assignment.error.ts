import { ApplicationError } from "@shared-kernel/errors/application.error";

export class UnauthorizedRoleAssignmentError extends ApplicationError {
    constructor() {
        super(
            'UNAUTHORIZED_ROLE_ASSIGNMENT',
            'No tienes permisos suficientes para realizar esta acción',
            403
        );
        this.name = 'UnauthorizedRoleAssignmentError';
    }
}
