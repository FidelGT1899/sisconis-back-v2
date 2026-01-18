import { Result } from "@shared-kernel/errors/result";
import { EntityBase, type BaseEntityProps } from "@shared-domain/entity.base";
import type { IIdGenerator } from "@shared-domain/ports/id-generator";

import type { InvalidEmailError } from "@users-domain/errors/invalid-email.error";
import type { InvalidDniError } from "@users-domain/errors/invalid-dni.error";
import type { InvalidPasswordError } from "@users-domain/errors/invalid-password.error";
import { TemporaryPasswordVO } from "@users-domain/value-objects/temporary-password.vo";
import { EmailVO } from "@users-domain/value-objects/email.vo";
import { PasswordVO } from "@users-domain/value-objects/password.vo";
import { DniVO } from "@users-domain/value-objects/dni.vo";

interface UserProps extends BaseEntityProps<string> {
    name: string;
    lastName: string;
    email: EmailVO;
    password: PasswordVO | TemporaryPasswordVO;
    dni: DniVO;
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
        return this.props.password.getValue();
    }

    public getDni(): string {
        return this.props.dni.getValue();
    }

    // Factory method
    public static create(
        payload: {
            name: string;
            lastName: string;
            email: string;
            dni: string;
        },
        idGenerator: IIdGenerator
    ): Result<UserEntity, InvalidEmailError> {
        const emailResult = EmailVO.create(payload.email);
        const dniResult = DniVO.create(payload.dni);

        if (emailResult.isErr()) {
            return Result.fail(emailResult.error());
        }

        if (dniResult.isErr()) {
            return Result.fail(dniResult.error());
        }

        const id = idGenerator.generate();

        const tempPassword = TemporaryPasswordVO.fromDni(dniResult.value());

        const user = new UserEntity({
            id,
            name: payload.name,
            lastName: payload.lastName,
            email: emailResult.value(),
            dni: dniResult.value(),
            password: tempPassword,
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
            dni: string;
        },
        createdAt: Date
    ): Result<UserEntity, InvalidEmailError> {
        const emailResult = EmailVO.create(payload.email);
        const dniResult = DniVO.create(payload.dni);

        if (emailResult.isErr()) {
            return Result.fail(emailResult.error());
        }

        if (dniResult.isErr()) {
            return Result.fail(dniResult.error());
        }

        const passwordVO = PasswordVO.fromHashed(payload.password);

        const user = new UserEntity({
            id,
            name: payload.name,
            lastName: payload.lastName,
            email: emailResult.value(),
            dni: dniResult.value(),
            password: passwordVO,
            createdAt,
            updatedAt: new Date(),
        });

        return Result.ok(user);
    }

    public static rehydrate(props: UserProps): UserEntity {
        return new UserEntity(props);
    }

    public isPasswordTemporary(): boolean {
        return this.props.password instanceof TemporaryPasswordVO;
    }

    // Behavior Method
    public changePassword(newPasswordRaw: string): Result<void, InvalidPasswordError> {
        const passwordResult = PasswordVO.create(newPasswordRaw);

        if (passwordResult.isErr()) {
            return Result.fail(passwordResult.error());
        }

        this.props.password = passwordResult.value();
        this.updatedAt = new Date();
        return Result.ok(undefined);
    }

    public resetToTemporaryPassword(): void {
        this.props.password = TemporaryPasswordVO.fromDni(this.props.dni);
        this.updatedAt = new Date();
    }

    public updateProfile(data: {
        name?: string | undefined;
        lastName?: string | undefined
    }): void {
        if (data.name !== undefined) this.props.name = data.name;
        if (data.lastName !== undefined) this.props.lastName = data.lastName;
        if (data.name !== undefined || data.lastName !== undefined) {
            this.updatedAt = new Date();
        }
    }

    public updateEmail(newEmailRaw: string): Result<void, InvalidEmailError> {
        const emailRes = EmailVO.create(newEmailRaw);
        if (emailRes.isErr()) return Result.fail(emailRes.error());

        this.props.email = emailRes.value();
        this.updatedAt = new Date();
        return Result.ok(undefined);
    }

    public updateDni(newDniRaw: string): Result<void, InvalidDniError> {
        const dniRes = DniVO.create(newDniRaw);
        if (dniRes.isErr()) return Result.fail(dniRes.error());

        this.props.dni = dniRes.value();
        this.updatedAt = new Date();
        return Result.ok(undefined);
    }
}
