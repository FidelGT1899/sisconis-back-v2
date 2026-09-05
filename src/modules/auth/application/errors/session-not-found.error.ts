import { ApplicationError } from "@shared-kernel/errors/application.error";

export class SessionNotFoundError extends ApplicationError {
    constructor() {
        super('SESSION_NOT_FOUND', 'Sesión no encontrada.', 404);
        this.name = 'SessionNotFoundError';
    }
}