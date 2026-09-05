import type { Result } from "@shared-kernel/errors/result";
import type { TokenExpiredError } from "@auth-domain/errors/token-expired.error";
import type { TokenVerificationFailedError } from "@auth-domain/errors/token-verification-failed.error";

export interface AccessTokenPayload {
    id: string;
    email: string;
    role: string;
    sessionId: string;
}

export interface ITokenService {
    generateAccessToken(payload: AccessTokenPayload): string;
    verifyAccessToken(
        token: string
    ): Result<AccessTokenPayload, TokenExpiredError | TokenVerificationFailedError>;
}