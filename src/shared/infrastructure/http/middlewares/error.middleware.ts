import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { AppError } from "@shared-kernel/errors/app.error";
import { UnexpectedError } from "@shared-kernel/errors/unexpected.error";
import type { ILogger } from "@shared-domain/ports/logger";
import { env } from "@shared-infrastructure/config/env";

export function createGlobalErrorMiddleware(logger: ILogger) {
    return function globalErrorMiddleware(
        error: unknown,
        _req: Request,
        res: Response,
        _next: NextFunction
    ): Response {
        // Zod Errors
        if (error instanceof ZodError) {
            logger.warn("Validation error", { issues: error.issues });
            return res.status(400).json({
                status: "error",
                error: {
                    code: "INVALID_INPUT",
                    message: "Invalid input data",
                    details: error.issues.map(issue => ({
                        field: issue.path.join("."),
                        rule: issue.code,
                        message: issue.message
                    })),
                },
            });
        }

        // App Errors
        if (error instanceof AppError) {
            logger.warn("Handled application error", { code: error.code, message: error.message });
            return res.status(error.statusCode).json({
                status: "error",
                error: {
                    code: error.code,
                    message: error.message,
                },
            });
        }

        // Errores no controlados
        if (error instanceof Error) {
            logger.error("Unhandled error", { message: error.message, stack: error.stack });

            const isProd = env.NODE_ENV === "production";
            const unexpected = new UnexpectedError(
                "UNEXPECTED_ERROR",
                isProd ? "Internal Server Error" : error.message
            );

            return res.status(unexpected.statusCode).json({
                status: "error",
                error: { code: unexpected.code, message: unexpected.message },
            });
        }

        // Algo que no es Error
        logger.error("Unhandled non-Error thrown", { error });
        return res.status(500).json({
            status: "error",
            error: {
                code: "INTERNAL_ERROR",
                message: "Internal Server Error",
            },
        });
    };
}