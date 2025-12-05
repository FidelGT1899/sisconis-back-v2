import { AppError } from "@shared-kernel/errors/app.error";

export class UnexpectedError extends AppError {
    constructor(message: string) {
        super(message, 500);
        this.name = 'UnexpectedError';
    }
}