import { Result } from "@shared-kernel/errors/result";
import { ValueObjectBase } from "@shared-domain/value-object.base";

import { InvalidPasswordError } from "@users-domain/errors/invalid-password.error";

export class PasswordVO extends ValueObjectBase {
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

    public static create(raw: string): Result<PasswordVO, InvalidPasswordError> {
        if (!this.isValid(raw)) {
            return Result.fail(new InvalidPasswordError());
        }

        return Result.ok(new PasswordVO(raw));
    }

    public static fromHashed(hash: string): PasswordVO {
        return new PasswordVO(hash);
    }

    private static isValid(value: string): boolean {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        return passwordRegex.test(value);
    }
}
