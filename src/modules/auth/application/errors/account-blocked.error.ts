import { ApplicationError } from "@shared-kernel/errors/application.error";

export class AccountBlockedError extends ApplicationError {
    constructor(retryAfterSeconds: number | null) {
        const message = retryAfterSeconds !== null
            ? `Cuenta bloqueada temporalmente. Intenta nuevamente en ${retryAfterSeconds} segundos.`
            : 'Cuenta bloqueada por actividad sospechosa. Contacta a soporte.';

        super('ACCOUNT_BLOCKED', message, 429);
        this.name = 'AccountBlockedError';
    }
}