import { ValueObjectBase } from "@shared-domain/value-object.base";

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

    public static fromDni(dni: DniVO): TemporaryPasswordVO {
        return new TemporaryPasswordVO(dni.getValue());
    }

    public static fromHashed(hashedValue: string): TemporaryPasswordVO {
        return new TemporaryPasswordVO(hashedValue);
    }
}
