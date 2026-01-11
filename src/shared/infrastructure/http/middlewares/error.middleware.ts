import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

import { AppError } from "@shared-kernel/errors/app.error";
import { UnexpectedError } from "@shared-kernel/errors/unexpected.error";

// TODO: Implement for the future
// const isProd = process.env.NODE_ENV === "production";
// const message = isProd
//   ? "Internal Server Error"
//   : error.message;


export function globalErrorMiddleware(
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response {
    // TODO: Implement proper error logging (e.g., to a file or monitoring service)
    // maybe winston or pino
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
    // if (error instanceof Error) {
    //     return res.status(500).json({
    //         status: "error",
    //         error: {
    //             code: "INTERNAL_ERROR",
    //             message: error.message || "Internal Server Error",
    //         },
    //     });
    // }

    if (error instanceof Error) {
        const unexpected = new UnexpectedError(
            "UNEXPECTED_ERROR",
            error.message
        );

        return res.status(unexpected.statusCode).json({
            status: "error",
            error: {
                code: unexpected.code,
                message: unexpected.message,
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
