import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";

export class DatabaseIntegrityError extends InfrastructureError {
    constructor(entityName: string, entityId: string, details: string) {
        const message = `Integrity Error in ${entityName} (ID: ${entityId}): ${details}`;
        super('DATABASE_INTEGRITY_ERROR', message, 500);
        this.name = 'DatabaseIntegrityError';
    }
}
