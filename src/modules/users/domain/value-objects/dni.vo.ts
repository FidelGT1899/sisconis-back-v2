import { Result } from "@shared-kernel/errors/result";
import { ValueObjectBase } from "@shared-domain/value-object.base";

import { InvalidDniError } from "@users-domain/errors/invalid-dni.error";

export class DniVO extends ValueObjectBase {
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

    public static create(raw: string): Result<DniVO, InvalidDniError> {
        const value = raw.trim();

        if (!this.isValid(value)) {
            return Result.fail(new InvalidDniError(value));
        }

        return Result.ok(new DniVO(value));
    }

    private static isValid(value: string): boolean {
        const dniRegex = /^\d{8}$/;
        return dniRegex.test(value);
    }
}
