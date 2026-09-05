import { Result } from "@shared-kernel/errors/result";
import { ValueObjectBase } from "@shared-domain/value-object.base";
import { InvalidRefreshTokenValueError } from "@auth-domain/errors/invalid-refresh-token-value.error";

const MIN_REFRESH_TOKEN_LENGTH = 32;

interface RefreshTokenProps {
    value: string;
}

export class RefreshTokenVO extends ValueObjectBase {
    private readonly props: RefreshTokenProps;

    private constructor(props: RefreshTokenProps) {
        super();
        this.props = props;
    }

    protected getEqualityComponents(): ReadonlyArray<unknown> {
        return [this.props.value];
    }

    public getValue(): string {
        return this.props.value;
    }

    public static create(raw: string): Result<RefreshTokenVO, InvalidRefreshTokenValueError> {
        const value = raw.trim();

        if (!value) {
            return Result.fail(new InvalidRefreshTokenValueError('empty'));
        }

        if (value.length < MIN_REFRESH_TOKEN_LENGTH) {
            return Result.fail(new InvalidRefreshTokenValueError('too-short'));
        }

        return Result.ok(new RefreshTokenVO({ value }));
    }
}