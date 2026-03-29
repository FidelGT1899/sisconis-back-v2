import { ApplicationError } from '@shared-kernel/errors/application.error';

export class RoleLevelAlreadyExistsError extends ApplicationError {
    constructor(level: number) {
        super('ROLE_LEVEL_ALREADY_EXISTS', `The hierarchy level '${level}' is already assigned to another role.`, 409);
        this.name = 'RoleLevelAlreadyExistsError';
    }
}
