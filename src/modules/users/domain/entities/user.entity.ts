import { Result } from "@shared-kernel/errors/result";
import { EntityBase, type BaseEntityProps } from "@shared-domain/entity.base";
import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

import type { InvalidEmailError } from "@users-domain/errors/invalid-email.error";
import type { InvalidDniError } from "@users-domain/errors/invalid-dni.error";
import type { InvalidPasswordError } from "@users-domain/errors/invalid-password.error";
import { EmailVO } from "@users-domain/value-objects/email.vo";
import { DniVO } from "@users-domain/value-objects/dni.vo";
import { PasswordFactory, type PasswordType } from "@users-domain/factories/password.factory";
import { TemporaryPasswordVO } from "@users-domain/value-objects/temporary-password.vo";

interface UserProps extends BaseEntityProps<string> {
    name: string;
    lastName: string;
    email: EmailVO;
    password: PasswordType;
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

    public requiresPasswordChange(): boolean {
        return this.isPasswordTemporary();
    }

    // Factory method
    public static async create(
        payload: {
            name: string;
            lastName: string;
            email: string;
            dni: string;
        },
        idGenerator: IEntityIdGenerator,
        hasher: IPasswordHasher
    ): Promise<Result<UserEntity, InvalidEmailError | InvalidDniError>> {
        const emailResult = EmailVO.create(payload.email);
        const dniResult = DniVO.create(payload.dni);

        if (emailResult.isErr()) {
            return Result.fail(emailResult.error());
        }

        if (dniResult.isErr()) {
            return Result.fail(dniResult.error());
        }

        const id = idGenerator.generate();

        const tempPassword = await PasswordFactory.createTemporaryFromDni(
            dniResult.value(),
            hasher
        );

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
            isTemporaryPassword: boolean;
        },
        createdAt: Date
    ): Result<UserEntity, InvalidEmailError | InvalidDniError> {
        const emailResult = EmailVO.create(payload.email);
        const dniResult = DniVO.create(payload.dni);

        if (emailResult.isErr()) {
            return Result.fail(emailResult.error());
        }

        if (dniResult.isErr()) {
            return Result.fail(dniResult.error());
        }

        const passwordVO = payload.isTemporaryPassword
            ? PasswordFactory.rehydrateTemporary(payload.password)
            : PasswordFactory.rehydratePermanent(payload.password);

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
    public async changePassword(
        newPasswordRaw: string,
        hasher: IPasswordHasher
    ): Promise<Result<void, InvalidPasswordError>> {
        const passwordResult = await PasswordFactory.createPermanent(newPasswordRaw, hasher);

        if (passwordResult.isErr()) {
            return Result.fail(passwordResult.error());
        }

        this.props.password = passwordResult.value();
        this.updatedAt = new Date();
        return Result.ok(undefined);
    }

    public async resetToTemporaryPassword(hasher: IPasswordHasher): Promise<void> {
        this.props.password = await PasswordFactory.createTemporaryFromDni(
            this.props.dni,
            hasher
        );
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

    public async verifyPassword(
        plainPassword: string,
        hasher: IPasswordHasher
    ): Promise<boolean> {
        return this.props.password.matches(plainPassword, hasher);
    }
}
