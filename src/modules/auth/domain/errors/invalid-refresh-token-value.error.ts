import { DomainError } from "@shared-kernel/errors/domain.error";

type InvalidRefreshTokenValueReason = 'empty' | 'too-short';

export class InvalidRefreshTokenValueError extends DomainError {
    constructor(reason: InvalidRefreshTokenValueReason) {
        super('INVALID_REFRESH_TOKEN_VALUE', `Refresh token inválido: ${reason}`, 400);
        this.name = 'InvalidRefreshTokenValueError';
    }
}