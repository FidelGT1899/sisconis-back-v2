import { ApplicationError } from "@shared-kernel/errors/application.error";

export class DniAlreadyInUseError extends ApplicationError {
    constructor(dni: string) {
        super(
            'DNI_ALREADY_IN_USE',
            `El dni ${dni} ya está en uso`,
            409
        );
        this.name = 'DniAlreadyInUseError';
    }
}
