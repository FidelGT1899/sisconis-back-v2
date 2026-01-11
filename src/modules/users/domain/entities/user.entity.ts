import { Result } from "@shared-kernel/errors/result";
import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import { EntityBase, type BaseEntityProps } from "@shared-domain/entity.base";

import type { InvalidEmailError } from "@users-domain/errors/invalid-email.error";
import { EmailVO } from "@users-domain/value-objects/email.vo";

interface UserProps extends BaseEntityProps<string> {
    name: string;
    lastName: string;
    email: EmailVO;
    password: string;
}

export class UserEntity extends EntityBase<string, UserProps> {
    private props: UserProps;

    private constructor(props: UserProps) {
        super(props);
        this.props = props;
    }

    public getName(): string {
        return this.props.name;
    }

    public getLastName(): string {
        return this.props.lastName;
    }

    public getEmail(): string {
        return this.props.email.getValue();
    }

    public getPassword(): string {
        return this.props.password;
    }

    // Factory method
    public static create(
        payload: {
            name: string;
            lastName: string;
            email: string;
            password: string;
        },
        idGenerator: IIdGenerator
    ): Result<UserEntity, InvalidEmailError> {
        const emailResult = EmailVO.create(payload.email);

        if (emailResult.isErr()) {
            return Result.fail(emailResult.error());
        }

        const id = idGenerator.generate();

        const user = new UserEntity({
            id,
            name: payload.name,
            lastName: payload.lastName,
            email: emailResult.value(),
            password: payload.password,
            createdAt: new Date(),
        });

        return Result.ok(user);
    }

    public static fromExisting(
        id: string,
        payload: {
            name: string;
            lastName: string;
            email: string;
            password: string;
        },
        createdAt: Date
    ): Result<UserEntity, InvalidEmailError> {
        const emailResult = EmailVO.create(payload.email);

        if (emailResult.isErr()) {
            return Result.fail(emailResult.error());
        }

        const user = new UserEntity({
            id,
            name: payload.name,
            lastName: payload.lastName,
            email: emailResult.value(),
            password: payload.password,
            createdAt,
            updatedAt: new Date(),
        });

        return Result.ok(user);
    }

    public static rehydrate(props: UserProps): UserEntity {
        return new UserEntity(props);
    }

    // Behavior Method
    public changePassword(password: string): boolean {
        // TODO: Implement password validation logic
        this.props.password = password;
        this.updatedAt = new Date();
        return true;
    }
}
