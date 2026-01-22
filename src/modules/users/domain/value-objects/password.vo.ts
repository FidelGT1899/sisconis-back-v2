import { Result } from "@shared-kernel/errors/result";
import { ValueObjectBase } from "@shared-domain/value-object.base";

import { InvalidPasswordError } from "@users-domain/errors/invalid-password.error";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

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

    public static async create(raw: string, hasher: IPasswordHasher): Promise<Result<PasswordVO, InvalidPasswordError>> {
        if (!this.isValid(raw)) {
            return Result.fail(new InvalidPasswordError());
        }

        const hashed = await hasher.hash(raw);
        return Result.ok(new PasswordVO(hashed));
    }

    public static fromHashed(hash: string): PasswordVO {
        return new PasswordVO(hash);
    }

    public async matches(plainPassword: string, hasher: IPasswordHasher): Promise<boolean> {
        return hasher.compare(plainPassword, this.value);
    }

    private static isValid(value: string): boolean {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
        return passwordRegex.test(value);
    }
}
