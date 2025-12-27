import { ValueObjectBase } from '@shared-domain/value-object.base';
import { InvalidEmailError } from '../errors/invalid-email.error';

export class EmailVO extends ValueObjectBase {
    private readonly value: string;

    private constructor(value: string) {
        super();
        if (!EmailVO.isValid(value)) {
            throw new InvalidEmailError(value);
        }
        this.value = value;
    }

    protected getEqualityComponents(): ReadonlyArray<unknown> {
        return [this.value];
    }

    public getValue(): string {
        return this.value;
    }

    public static create(value: string): EmailVO {
        return new EmailVO(value);
    }

    private static isValid(value: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }
}
