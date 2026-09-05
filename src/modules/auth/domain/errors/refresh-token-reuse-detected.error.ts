import { DomainError } from "@shared-kernel/errors/domain.error";

export class RefreshTokenReuseDetectedError extends DomainError {
    constructor() {
        super(
            'REFRESH_TOKEN_REUSE_DETECTED',
            'Se detectó reuso de refresh token. Todas las sesiones del usuario fueron revocadas.',
            403
        );
        this.name = 'RefreshTokenReuseDetectedError';
    }
}