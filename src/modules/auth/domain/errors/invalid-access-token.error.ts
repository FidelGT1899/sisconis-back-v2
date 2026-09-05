import { DomainError } from "@shared-kernel/errors/domain.error";

type InvalidAccessTokenReason = 'empty';

export class InvalidAccessTokenError extends DomainError {
    constructor(reason: InvalidAccessTokenReason) {
        super('INVALID_ACCESS_TOKEN', `Access token inválido: ${reason}`, 400);
        this.name = 'InvalidAccessTokenError';
    }
}