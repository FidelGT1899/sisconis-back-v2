import { ApplicationError } from '@shared-kernel/errors/application.error';

export class UserAlreadyExistsError extends ApplicationError {
    constructor(email: string) {
        super('USER_ALREADY_EXISTS', `The email '${email}' is already registered.`, 409);
        this.name = 'UserAlreadyExistsError';
    }
}