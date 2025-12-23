import { AppError } from "./app.error";

export class DomainError extends AppError {
    constructor(code: string, message: string, statusCode: number = 400) {
        super(code, message, statusCode);
        this.name = 'DomainError';
    }
}