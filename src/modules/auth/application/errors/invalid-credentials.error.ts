import { ApplicationError } from "@shared-kernel/errors/application.error";

export class InvalidCredentialsError extends ApplicationError {
    constructor() {
        super(
            'INVALID_CREDENTIALS',
            'Credenciales inválidas.',
            401
        );
        this.name = 'InvalidCredentialsError';
    }
}