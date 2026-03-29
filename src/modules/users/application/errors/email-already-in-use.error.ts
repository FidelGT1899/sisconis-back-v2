import { ApplicationError } from "@shared-kernel/errors/application.error";

export class EmailAlreadyInUseError extends ApplicationError {
    constructor(email: string) {
        super(
            'EMAIL_ALREADY_IN_USE',
            `El email ${email} ya está en uso`,
            409
        );
        this.name = 'EmailAlreadyInUseError';
    }
}
