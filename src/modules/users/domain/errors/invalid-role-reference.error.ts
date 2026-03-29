import { DomainError } from "@shared-kernel/errors/domain.error";

export class InvalidRoleReferenceError extends DomainError {
    constructor(reason: string) {
        super('INVALID_ROLE_REFERENCE', reason, 400);
    }
}
