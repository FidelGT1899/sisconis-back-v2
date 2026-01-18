import { Prisma } from "@prisma-generated";

import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";
import { AppError } from "@shared-kernel/errors/app.error";

import { PrismaErrorCodes, type PrismaErrorCode } from "./prisma.error-codes";

export class PrismaErrorMapper {
    static mapError(error: unknown): AppError {
        if (error instanceof AppError) {
            return error;
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return this.mapKnownRequestError(error);
        }

        if (error instanceof Prisma.PrismaClientValidationError) {
            return new InfrastructureError(
                'VALIDATION_ERROR',
                'Database query validation error',
                400
            );
        }

        if (error instanceof Prisma.PrismaClientInitializationError) {
            return new InfrastructureError(
                'DB_INIT_ERROR',
                'Failed to initialize database connection',
                503
            );
        }

        if (error instanceof Prisma.PrismaClientRustPanicError) {
            return new InfrastructureError(
                'DB_PANIC_ERROR',
                'Critical database connection error',
                500
            );
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return new InfrastructureError(
            'UNKNOWN_ERROR',
            message,
            500
        );
    }

    private static mapKnownRequestError(error: Prisma.PrismaClientKnownRequestError): InfrastructureError {
        const code = (error as { code: string }).code as PrismaErrorCode;

        switch (code) {
            case PrismaErrorCodes.UNIQUE_CONSTRAINT:
                return new InfrastructureError(
                    'UNIQUE_CONSTRAINT_VIOLATION',
                    this.formatUniqueConstraintMessage(error),
                    409
                );

            case PrismaErrorCodes.FOREIGN_KEY_CONSTRAINT:
                return new InfrastructureError(
                    'FOREIGN_KEY_VIOLATION',
                    'Foreign key constraint violation: referenced record does not exist',
                    400
                );

            case PrismaErrorCodes.NULL_CONSTRAINT:
                return new InfrastructureError(
                    'NULL_CONSTRAINT_VIOLATION',
                    'Required field cannot be null',
                    400
                );

            case PrismaErrorCodes.RELATION_CONSTRAINT:
                return new InfrastructureError(
                    'RELATION_CONSTRAINT_VIOLATION',
                    'Relation constraint violation',
                    400
                );

            case PrismaErrorCodes.RECORD_NOT_FOUND:
                return new InfrastructureError(
                    'RECORD_NOT_FOUND',
                    'The requested record was not found',
                    404
                );

            case PrismaErrorCodes.CANNOT_REACH_DB:
                return new InfrastructureError(
                    'DATABASE_UNREACHABLE',
                    'Cannot connect to database',
                    503
                );

            case PrismaErrorCodes.CONNECTION_TIMEOUT:
                return new InfrastructureError(
                    'CONNECTION_TIMEOUT',
                    'Database connection timeout',
                    504
                );

            case PrismaErrorCodes.QUERY_TIMEOUT:
                return new InfrastructureError(
                    'QUERY_TIMEOUT',
                    'Query execution timeout',
                    504
                );

            default:
                return new InfrastructureError(
                    'DATABASE_ERROR',
                    `Database error: ${(error as Error).message}`,
                    500
                );
        }
    }

    private static formatUniqueConstraintMessage(
        error: Prisma.PrismaClientKnownRequestError
    ): string {
        type ErrorWithMeta = {
            meta?: {
                target?: string[] | string;
                modelName?: string;
            }
        };

        const meta = (error as unknown as ErrorWithMeta).meta;

        let fields: string[] = [];

        if (meta?.target) {
            if (Array.isArray(meta.target)) {
                fields = meta.target;
            } else {
                fields = [String(meta.target)];
            }
        }

        if (fields.length === 0) {
            const message = (error as Error).message;

            const match = message.match(/fields?: \(`(.+?)`\)/i);

            if (match && match[1]) {
                fields = match[1].split('`,`').map((field) => field.trim());
            }
        }

        const fieldMessages: Record<string, string> = {
            'dni': 'DNI',
            'email': 'email',
            'username': 'username',
        };

        const friendlyFields = fields
            .map(field => fieldMessages[field.toLowerCase()] || field)
            .join(', ');

        return `A record with the same value already exists for: ${friendlyFields || 'this field'}`;
    }
}
