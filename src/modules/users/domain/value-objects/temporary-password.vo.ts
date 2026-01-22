import { ValueObjectBase } from "@shared-domain/value-object.base";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

import type { DniVO } from "@users-domain/value-objects/dni.vo";

export class TemporaryPasswordVO extends ValueObjectBase {
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

    public async matches(plainPassword: string, hasher: IPasswordHasher): Promise<boolean> {
        return hasher.compare(plainPassword, this.value);
    }

    public static async fromDni(dni: DniVO, hasher: IPasswordHasher): Promise<TemporaryPasswordVO> {
        const hashedDni = await hasher.hash(dni.getValue());
        return new TemporaryPasswordVO(hashedDni);
    }

    public static fromHashed(hashedValue: string): TemporaryPasswordVO {
        return new TemporaryPasswordVO(hashedValue);
    }
}
