import { Result } from "@shared-kernel/errors/result";
import { ValueObjectBase } from "@shared-domain/value-object.base";
import { InvalidAccessTokenError } from "@auth-domain/errors/invalid-access-token.error";

interface AccessTokenProps {
    value: string;
}

export class AccessTokenVO extends ValueObjectBase {
    private readonly props: AccessTokenProps;

    private constructor(props: AccessTokenProps) {
        super();
        this.props = props;
    }

    protected getEqualityComponents(): ReadonlyArray<unknown> {
        return [this.props.value];
    }

    public getValue(): string {
        return this.props.value;
    }

    public static create(raw: string): Result<AccessTokenVO, InvalidAccessTokenError> {
        const value = raw.trim();

        if (!value) {
            return Result.fail(new InvalidAccessTokenError('empty'));
        }

        return Result.ok(new AccessTokenVO({ value }));
    }
}