export abstract class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;

    protected constructor(code: string, message: string, statusCode: number = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}