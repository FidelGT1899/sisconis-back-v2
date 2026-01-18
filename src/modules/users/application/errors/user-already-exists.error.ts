import { ApplicationError } from '@shared-kernel/errors/application.error';

export class UserAlreadyExistsError extends ApplicationError {
    constructor(field: 'email' | 'dni', value: string) {
        const fieldNames = {
            email: 'email',
            dni: 'DNI'
        };

        super('USER_ALREADY_EXISTS', `The ${fieldNames[field]} '${value}' is already registered.`, 409);
        this.name = 'UserAlreadyExistsError';
    }
}
