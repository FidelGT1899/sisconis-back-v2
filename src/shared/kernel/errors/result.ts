import type { AppError } from "./app.error";

export class Result<T, E extends AppError = AppError> {
    private constructor(
        private readonly _isOk: boolean,
        private readonly _value?: T,
        private readonly _error?: E
    ) {}

    public static ok<T, E extends AppError>(value: T): Result<T, E> {
        return new Result<T, E>(true, value);
    }

    public static fail<T, E extends AppError>(error: E): Result<T, E> {
        return new Result<T, E>(false, undefined, error);
    }

    public isOk(): boolean {
        return this._isOk;
    }

    public isErr(): boolean {
        return !this._isOk;
    }

    public value(): T {
        if (!this._isOk) {
            throw new Error("Can't get the value of an error result");
        }
        return this._value as T;
    }

    public error(): E {
        if (this._isOk) {
            throw new Error("Can't get the error of a success result. Check isOk() first.");
        }
        return this._error as E;
    }
}
