import { AppError } from "@shared-kernel/errors/app.error";
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function globalErrorMiddleware(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response {
    console.error("Unhandled error:", error);

    // Zod Errors
    if (error instanceof ZodError) {
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
        return res.status(error.statusCode).json({
            status: "error",
            error: {
                code: error.code,
                message: error.message,
            },
        });
    }

    // Generic Error
    if (error instanceof Error) {
        return res.status(500).json({
            status: "error",
            error: {
                code: "INTERNAL_ERROR",
                message: error.message || "Internal Server Error",
            },
        });
    }

    // 
    return res.status(500).json({
        status: "error",
        error: {
            code: "INTERNAL_ERROR",
            message: "Internal Server Error",
        },
    });
}
