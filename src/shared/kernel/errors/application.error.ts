import { AppError } from "./app.error";

export class ApplicationError extends AppError {
    constructor(message: string, statusCode: number = 400) {
        super(message, statusCode);
        this.name = 'ApplicationError';
    }
}