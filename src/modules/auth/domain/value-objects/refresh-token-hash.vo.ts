import { Result } from "@shared-kernel/errors/result";
import { ValueObjectBase } from "@shared-domain/value-object.base";
import { InvalidRefreshTokenHashError } from "@auth-domain/errors/invalid-refresh-token-hash.error";

interface RefreshTokenHashProps {
    value: string;
}

export class RefreshTokenHashVO extends ValueObjectBase {
    private readonly props: RefreshTokenHashProps;

    private constructor(props: RefreshTokenHashProps) {
        super();
        this.props = props;
    }

    protected getEqualityComponents(): ReadonlyArray<unknown> {
        return [this.props.value];
    }

    public getValue(): string {
        return this.props.value;
    }

    public static create(raw: string): Result<RefreshTokenHashVO, InvalidRefreshTokenHashError> {
        if (!raw || raw.trim().length === 0) {
            return Result.fail(new InvalidRefreshTokenHashError());
        }

        return Result.ok(new RefreshTokenHashVO({ value: raw }));
    }
}