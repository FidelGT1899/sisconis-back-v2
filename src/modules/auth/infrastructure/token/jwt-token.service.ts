import jwt from "jsonwebtoken";
import { injectable } from "inversify";
import { z } from "zod";

import { Result } from "@shared-kernel/errors/result";
import { env } from "@shared-infrastructure/config/env";
import { AuthPolicy } from "@auth-domain/constants/auth-policy";
import { TokenExpiredError } from "@auth-domain/errors/token-expired.error";
import { TokenVerificationFailedError } from "@auth-domain/errors/token-verification-failed.error";
import type { ITokenService, AccessTokenPayload } from "@auth-domain/ports/token.service.interface";

const accessTokenPayloadSchema = z.object({
    id: z.string(),
    email: z.string(),
    role: z.string(),
    sessionId: z.string(),
});

@injectable()
export class JwtTokenService implements ITokenService {
    public generateAccessToken(payload: AccessTokenPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: AuthPolicy.ACCESS_TOKEN_TTL_SECONDS,
        });
    }

    public verifyAccessToken(
        token: string
    ): Result<AccessTokenPayload, TokenExpiredError | TokenVerificationFailedError> {
        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);

            const result = accessTokenPayloadSchema.safeParse(decoded);
            if (!result.success) {
                return Result.fail(new TokenVerificationFailedError());
            }

            return Result.ok(result.data);
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return Result.fail(new TokenExpiredError());
            }
            return Result.fail(new TokenVerificationFailedError());
        }
    }
}