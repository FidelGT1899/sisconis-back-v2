import { AppError } from "./app.error";

export class DomainError extends AppError {
    constructor(message: string, statusCode: number = 400) {
        super(message, statusCode);
        this.name = 'DomainError';
    }
}