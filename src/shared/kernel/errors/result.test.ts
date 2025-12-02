import { AppError } from "./app.error";
import { Result } from "./result";

class CustomTestError extends AppError {
    constructor() {
        super('Test error occurred', 418);
    }
}

describe('Result<T, E>', () => {
    it('should create a Success result correctly', () => {
        const value = 'success data';
        const result = Result.ok<string, CustomTestError>(value);

        expect(result.isOk()).toBe(true);
        expect(result.isErr()).toBe(false);
        expect(result.value()).toBe(value);
    });

    it('should create a Failure result correctly', () => {
        const error = new CustomTestError();
        const result = Result.fail<string, CustomTestError>(error);

        expect(result.isOk()).toBe(false);
        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(CustomTestError);
        expect(result.error().statusCode).toBe(418);
    });

    it('should throw an error when accessing value of a Failure result', () => {
        const result = Result.fail<string, CustomTestError>(new CustomTestError());

        expect(() => result.value()).toThrow("Can't get the value of an error result");
    });

    it('should throw an error when accessing error of a Success result', () => {
        const result = Result.ok<number, CustomTestError>(123);

        expect(() => result.error()).toThrow("Can't get the error of a success result. Check isOk() first.");
    });
});