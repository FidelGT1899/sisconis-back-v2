import { DomainError } from "@shared-kernel/errors/domain.error";

export class CannotAssignRoleError extends DomainError {
    constructor() {
        super(
            'CANNOT_ASSIGN_ROLE',
            `Cannot assign inactive role to user.`,
            400
        );
        this.name = 'CannotAssignRoleError';
    }
}
