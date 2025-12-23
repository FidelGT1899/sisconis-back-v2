import { AppError } from "@shared-kernel/errors/app.error";

export class UnexpectedError extends AppError {
    constructor(code: string, message: string, statusCode: number = 500) {
        super(code, message, statusCode);
        this.name = 'UnexpectedError';
    }
}