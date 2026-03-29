import { ApplicationError } from "@shared-kernel/errors/application.error";

export class FailedToCreateRoleReferenceError extends ApplicationError {
    constructor(roleName: string, reason: string) {
        super(
            'FAILED_TO_CREATE_ROLE_REFERENCE',
            `Failed to create role reference for role "${roleName}": ${reason}`,
            500
        );
        this.name = 'FailedToCreateRoleReferenceError';
    }
}
