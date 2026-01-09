import { ValueObjectBase } from '@shared-domain/value-object.base';
import { InvalidEmailError } from '../errors/invalid-email.error';
import { Result } from '@shared-kernel/errors/result';

export class EmailVO extends ValueObjectBase {
    private readonly value: string;

    private constructor(value: string) {
        super();
        this.value = value;
    }

    protected getEqualityComponents(): ReadonlyArray<unknown> {
        return [this.value];
    }

    public getValue(): string {
        return this.value;
    }

    public static create(raw: string): Result<EmailVO, InvalidEmailError> {
        const value = raw.trim().toLowerCase();
        if (!this.isValid(value)) {
            return Result.fail(new InvalidEmailError(value));
        }
        return Result.ok(new EmailVO(value));
    }

    private static isValid(value: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }
}
