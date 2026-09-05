import { ApplicationError } from "@shared-kernel/errors/application.error";

export class CannotModifyOwnRoleError extends ApplicationError {
    constructor() {
        super(
            'CANNOT_MODIFY_OWN_ROLE',
            'No puedes modificar tu propio rol',
            403
        );
        this.name = 'CannotModifyOwnRoleError';
    }
}