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
import { RoleReferenceVO } from "@users-domain/value-objects/role-reference.vo";
import { CannotAssignRoleError } from "@users-domain/errors/cannot-assign-role.error";
import { UserAlreadyActiveError } from "@users-domain/errors/user-already-active.error";
import { UserAlreadyInactiveError } from "@users-domain/errors/user-already-deactive.error";
import { UserAlreadySuspendedError } from "@users-domain/errors/user-already-suspended.error";
import { UserNotDeletableError } from "@users-domain/errors/user-not-deletable.error";
import { UserNotActiveError } from "@users-domain/errors/user-not-active.error";

export enum UserStatus {
    SUSPENDED = 'SUSPENDED',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

interface UserProps extends BaseEntityProps<string> {
    name: string;
    lastName: string;
    email: EmailVO;
    password: PasswordType;
    dni: DniVO;
    role: RoleReferenceVO;
    status: UserStatus;
    phone?: string;
    address?: string;
    photoUrl?: string;
}

export class UserEntity extends EntityBase<string, UserProps> {
    private props: UserProps;

    private constructor(props: UserProps) {
        super(props);
        this.props = props;
    }

    // --- Getters ---
    public getName(): string { return this.props.name; }
    public getLastName(): string { return this.props.lastName; }
    public getEmail(): string { return this.props.email.getValue(); }
    public getPassword(): string { return this.props.password.getValue(); }
    public getDni(): string { return this.props.dni.getValue(); }
    public getRole(): RoleReferenceVO { return this.props.role; }
    public getRoleId(): string { return this.props.role.getId(); }
    public getRoleName(): string { return this.props.role.getName(); }
    public getRoleLevel(): number { return this.props.role.getLevel(); }
    public getStatus(): UserStatus { return this.props.status; }
    public isActive(): boolean { return this.props.status === UserStatus.ACTIVE; }
    public isInactive(): boolean { return this.props.status === UserStatus.INACTIVE; }
    public isSuspended(): boolean { return this.props.status === UserStatus.SUSPENDED; }
    public getPhone(): string | undefined { return this.props.phone; }
    public getAddress(): string | undefined { return this.props.address; }
    public getPhotoUrl(): string | undefined { return this.props.photoUrl; }

    // --- Business Logic of Password ---
    public requiresPasswordChange(): boolean {
        return this.isPasswordTemporary();
    }

    public isPasswordTemporary(): boolean {
        return this.props.password instanceof TemporaryPasswordVO;
    }

    // --- Business Logic of Role ---
    public hasActiveRole(): boolean {
        return this.props.role.isActive();
    }

    public canManageUser(targetUser: UserEntity): boolean {
        return this.props.role.canManageLevel(targetUser.getRoleLevel());
    }

    // --- Factory Method from New User ---
    public static async create(
        payload: {
            name: string;
            lastName: string;
            email: string;
            dni: string;
            role: RoleReferenceVO;
            phone?: string;
            address?: string;
            photoUrl?: string;
        },
        idGenerator: IEntityIdGenerator,
        hasher: IPasswordHasher
    ): Promise<Result<UserEntity, InvalidEmailError | InvalidDniError | CannotAssignRoleError>> {
        const emailResult = EmailVO.create(payload.email);
        const dniResult = DniVO.create(payload.dni);

        if (emailResult.isErr()) {
            return Result.fail(emailResult.error());
        }

        if (dniResult.isErr()) {
            return Result.fail(dniResult.error());
        }

        if (!payload.role.isAssignable()) {
            return Result.fail(new CannotAssignRoleError());
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
            role: payload.role,
            status: UserStatus.ACTIVE,
            ...(payload.phone && { phone: payload.phone }),
            ...(payload.address && { address: payload.address }),
            ...(payload.photoUrl && { photoUrl: payload.photoUrl }),
            createdAt: new Date(),
        });

        return Result.ok(user);
    }

    // --- Factory Method from Existing User(DB/Prisma) ---
    public static fromExisting(
        id: string,
        payload: {
            name: string;
            lastName: string;
            email: string;
            password: string;
            dni: string;
            role: RoleReferenceVO;
            isTemporaryPassword: boolean;
            status: UserStatus;
            phone?: string;
            address?: string;
            photoUrl?: string;
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
            role: payload.role,
            status: payload.status,
            ...(payload.phone && { phone: payload.phone }),
            ...(payload.address && { address: payload.address }),
            ...(payload.photoUrl && { photoUrl: payload.photoUrl }),
            createdAt,
            updatedAt: new Date(),
        });

        return Result.ok(user);
    }

    public static rehydrate(props: UserProps): UserEntity {
        return new UserEntity(props);
    }

    // --- Behavior Methods ---
    public changeRole(newRole: RoleReferenceVO): Result<void, CannotAssignRoleError> {
        if (!newRole.isAssignable()) {
            return Result.fail(new CannotAssignRoleError());
        }

        if (this.props.role.equals(newRole)) {
            return Result.ok(undefined);
        }

        this.props.role = newRole;
        this.updatedAt = new Date();

        return Result.ok(undefined);
    }

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

    // --- Other Methods ---
    // TODO: Esto puede volverse algo complejo a futuro, puede ser Domain Service
    public async resetToTemporaryPassword(hasher: IPasswordHasher): Promise<void> {
        this.props.password = await PasswordFactory.createTemporaryFromDni(
            this.props.dni,
            hasher
        );
        this.updatedAt = new Date();
    }

    public updateProfile(data: {
        name?: string;
        lastName?: string;
        phone?: string;
        address?: string;
        photoUrl?: string;
    }): void {
        if (data.name !== undefined) this.props.name = data.name;
        if (data.lastName !== undefined) this.props.lastName = data.lastName;
        if (data.phone !== undefined) this.props.phone = data.phone;
        if (data.address !== undefined) this.props.address = data.address;
        if (data.photoUrl !== undefined) this.props.photoUrl = data.photoUrl;

        if (Object.values(data).some(v => v !== undefined)) {
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

    public activate(): void {
        this.props.status = UserStatus.ACTIVE;
        this.updatedAt = new Date();
    }

    public deactivate(): void {
        this.props.status = UserStatus.INACTIVE;
        this.updatedAt = new Date();
    }

    public suspend(): void {
        this.props.status = UserStatus.SUSPENDED;
        this.updatedAt = new Date();
    }

    public ensureCanActivate(): Result<void, UserAlreadyActiveError> {
        if (this.props.status === UserStatus.ACTIVE) {
            return Result.fail(new UserAlreadyActiveError(this.id));
        }
        return Result.ok(undefined);
    }

    public ensureCanDeactivate(): Result<void, UserAlreadyInactiveError> {
        if (this.props.status === UserStatus.INACTIVE) {
            return Result.fail(new UserAlreadyInactiveError(this.id));
        }
        return Result.ok(undefined);
    }

    public ensureCanSuspend(): Result<void, UserAlreadySuspendedError> {
        if (this.props.status === UserStatus.SUSPENDED) {
            return Result.fail(new UserAlreadySuspendedError(this.id));
        }
        return Result.ok(undefined);
    }

    public ensureDeletable(): Result<void, UserNotDeletableError> {
        if (this.props.status !== UserStatus.INACTIVE) {
            return Result.fail(new UserNotDeletableError(this.id));
        }
        return Result.ok(undefined);
    }

    public ensureRoleAssignable(): Result<void, UserNotActiveError> {
        if (this.props.status !== UserStatus.ACTIVE) {
            return Result.fail(new UserNotActiveError(this.id));
        }
        return Result.ok(undefined);
    }
}
