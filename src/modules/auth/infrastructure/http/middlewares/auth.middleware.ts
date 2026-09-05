import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ITokenService } from "@auth-domain/ports/token.service.interface";
import type { IAccessTokenBlacklist } from "@auth-domain/ports/access-token-blacklist.interface";
import { TokenExpiredError } from "@auth-domain/errors/token-expired.error";

export interface AuthenticatedUser {
    userId: string;
    email: string;
    role: string;
    sessionId: string;
}

// Forma recomendada por Express: aumentar el namespace global, no el módulo interno de tipos
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            auth?: AuthenticatedUser;
        }
    }
}

export function createAuthMiddleware(
    tokenService: ITokenService,
    accessTokenBlacklist: IAccessTokenBlacklist
): RequestHandler {
    return async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({
                status: "error",
                error: { code: "MISSING_ACCESS_TOKEN", message: "Access token is required" },
            });
            return;
        }

        const token = authHeader.slice("Bearer ".length);
        const verifyResult = tokenService.verifyAccessToken(token);

        if (verifyResult.isErr()) {
            const error = verifyResult.error();
            const code = error instanceof TokenExpiredError ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
            res.status(401).json({
                status: "error",
                error: { code, message: error.message },
            });
            return;
        }

        const payload = verifyResult.value();

        // Invalidación inmediata: aunque la firma sea válida, la sesión pudo revocarse
        const isBlacklisted = await accessTokenBlacklist.isBlacklisted(payload.sessionId);
        if (isBlacklisted) {
            res.status(401).json({
                status: "error",
                error: { code: "SESSION_REVOKED", message: "Session has been revoked" },
            });
            return;
        }

        req.auth = {
            userId: payload.id,
            email: payload.email,
            role: payload.role,
            sessionId: payload.sessionId,
        };

        next();
    };
}