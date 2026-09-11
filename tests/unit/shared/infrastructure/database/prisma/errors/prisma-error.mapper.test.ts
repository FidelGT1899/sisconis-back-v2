import { Prisma } from '@prisma/client';

import { PrismaErrorMapper } from '@shared-infrastructure/database/prisma/errors/prisma-error.mapper';
import { InfrastructureError } from '@shared-kernel/errors/infrastructure.error';
import { PrismaErrorCodes } from '@shared-infrastructure/database/prisma/errors/prisma.error-codes';

const CLIENT_VERSION = '7.0.0';

const makeKnownRequestError = (
    code: string,
    message = 'test error',
    meta?: Record<string, unknown>
) =>
    new Prisma.PrismaClientKnownRequestError(message, {
        code,
        clientVersion: CLIENT_VERSION,
        ...(meta && { meta }),
    });

const makeValidationError = (message: string) =>
    new Prisma.PrismaClientValidationError(message, { clientVersion: CLIENT_VERSION } as never);

const makeInitError = (message: string) =>
    new Prisma.PrismaClientInitializationError(message, { clientVersion: CLIENT_VERSION } as never);

const makeRustPanicError = (message: string) =>
    new Prisma.PrismaClientRustPanicError(message, { clientVersion: CLIENT_VERSION } as never);

describe('PrismaErrorMapper', () => {
    describe('mapError', () => {
        it('should pass through AppError unchanged', () => {
            const error = new InfrastructureError('TEST_CODE', 'test', 400);
            const result = PrismaErrorMapper.mapError(error);
            expect(result).toBe(error);
        });

        it('should map PrismaClientValidationError to 400 VALIDATION_ERROR', () => {
            const error = makeValidationError('invalid query');
            const result = PrismaErrorMapper.mapError(error);
            expect(result).toBeInstanceOf(InfrastructureError);
            expect(result.code).toBe('VALIDATION_ERROR');
            expect(result.statusCode).toBe(400);
        });

        it('should map PrismaClientInitializationError to 503 DB_INIT_ERROR', () => {
            const error = makeInitError('cannot connect');
            const result = PrismaErrorMapper.mapError(error);
            expect(result).toBeInstanceOf(InfrastructureError);
            expect(result.code).toBe('DB_INIT_ERROR');
            expect(result.statusCode).toBe(503);
        });

        it('should map PrismaClientRustPanicError to 500 DB_PANIC_ERROR', () => {
            const error = makeRustPanicError('rust panic');
            const result = PrismaErrorMapper.mapError(error);
            expect(result).toBeInstanceOf(InfrastructureError);
            expect(result.code).toBe('DB_PANIC_ERROR');
            expect(result.statusCode).toBe(500);
        });

        it('should map generic Error to 500 UNKNOWN_ERROR', () => {
            const error = new Error('something broke');
            const result = PrismaErrorMapper.mapError(error);
            expect(result).toBeInstanceOf(InfrastructureError);
            expect(result.code).toBe('UNKNOWN_ERROR');
            expect(result.message).toBe('something broke');
            expect(result.statusCode).toBe(500);
        });

        it('should map unknown value to 500 UNKNOWN_ERROR with default message', () => {
            const result = PrismaErrorMapper.mapError('not an error');
            expect(result).toBeInstanceOf(InfrastructureError);
            expect(result.code).toBe('UNKNOWN_ERROR');
            expect(result.message).toBe('Unknown error');
            expect(result.statusCode).toBe(500);
        });

        describe('PrismaClientKnownRequestError codes', () => {
            it('should map P2002 (UNIQUE_CONSTRAINT) to 409', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.UNIQUE_CONSTRAINT,
                    'Unique constraint failed',
                    { target: ['email'] }
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result).toBeInstanceOf(InfrastructureError);
                expect(result.code).toBe('UNIQUE_CONSTRAINT_VIOLATION');
                expect(result.statusCode).toBe(409);
                expect(result.message).toContain('email');
            });

            it('should format unique constraint message with meta.target as string', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.UNIQUE_CONSTRAINT,
                    'Unique constraint failed',
                    { target: 'dni' }
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.message).toContain('DNI');
            });

            it('should format unique constraint message from error message when no meta.target', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.UNIQUE_CONSTRAINT,
                    'Unique constraint failed on the fields: (`email`)'
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.message).toContain('email');
            });

            it('should use friendly names for known fields', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.UNIQUE_CONSTRAINT,
                    'Unique constraint failed',
                    { target: ['dni', 'email'] }
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.message).toContain('DNI');
                expect(result.message).toContain('email');
            });

            it('should fallback to field name for unknown fields', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.UNIQUE_CONSTRAINT,
                    'Unique constraint failed',
                    { target: ['custom_field'] }
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.message).toContain('custom_field');
            });

            it('should fallback to generic message when no target and no regex match', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.UNIQUE_CONSTRAINT,
                    'some other message'
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.message).toContain('this field');
            });

            it('should map P2003 (FOREIGN_KEY_CONSTRAINT) to 400', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.FOREIGN_KEY_CONSTRAINT
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.code).toBe('FOREIGN_KEY_VIOLATION');
                expect(result.statusCode).toBe(400);
            });

            it('should map P2011 (NULL_CONSTRAINT) to 400', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.NULL_CONSTRAINT
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.code).toBe('NULL_CONSTRAINT_VIOLATION');
                expect(result.statusCode).toBe(400);
            });

            it('should map P2014 (RELATION_CONSTRAINT) to 400', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.RELATION_CONSTRAINT
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.code).toBe('RELATION_CONSTRAINT_VIOLATION');
                expect(result.statusCode).toBe(400);
            });

            it('should map P2025 (RECORD_NOT_FOUND) to 404', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.RECORD_NOT_FOUND
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.code).toBe('RECORD_NOT_FOUND');
                expect(result.statusCode).toBe(404);
            });

            it('should map P1001 (CANNOT_REACH_DB) to 503', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.CANNOT_REACH_DB
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.code).toBe('DATABASE_UNREACHABLE');
                expect(result.statusCode).toBe(503);
            });

            it('should map P1008 (CONNECTION_TIMEOUT) to 504', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.CONNECTION_TIMEOUT
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.code).toBe('CONNECTION_TIMEOUT');
                expect(result.statusCode).toBe(504);
            });

            it('should map P2024 (QUERY_TIMEOUT) to 504', () => {
                const error = makeKnownRequestError(
                    PrismaErrorCodes.QUERY_TIMEOUT
                );
                const result = PrismaErrorMapper.mapError(error);
                expect(result.code).toBe('QUERY_TIMEOUT');
                expect(result.statusCode).toBe(504);
            });

            it('should map unknown Prisma code to 500 DATABASE_ERROR', () => {
                const error = makeKnownRequestError('P9999');
                const result = PrismaErrorMapper.mapError(error);
                expect(result.code).toBe('DATABASE_ERROR');
                expect(result.statusCode).toBe(500);
            });
        });
    });
});
