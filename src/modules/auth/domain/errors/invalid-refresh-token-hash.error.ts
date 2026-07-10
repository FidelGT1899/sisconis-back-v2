import { DomainError } from "@shared-kernel/errors/domain.error";

export class InvalidRefreshTokenHashError extends DomainError {
    constructor() {
        super(
            'INVALID_REFRESH_TOKEN_HASH',
            'El hash del refresh token es inválido.',
            422
        );
        this.name = 'InvalidRefreshTokenHashError';
    }
}
