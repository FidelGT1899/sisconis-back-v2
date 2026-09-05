import { UserEntity, UserStatus } from '@users-domain/entities/user.entity';
import type { RoleReferenceVO } from '@users-domain/value-objects/role-reference.vo';
import { makeRoleReference } from './role.factory';

export interface UserPropsOverrides {
    name?: string;
    lastName?: string;
    email?: string;
    dni?: string;
    role?: RoleReferenceVO;
    roleLevel?: number;
    phone?: string;
    address?: string;
    photoUrl?: string;
}

export interface ExistingUserPropsOverrides extends UserPropsOverrides {
    id?: string;
    password?: string;
    isTemporaryPassword?: boolean;
    status?: UserStatus;
    createdAt?: Date;
}

export const makeUserProps = (overrides: UserPropsOverrides = {}) => ({
    name: overrides.name ?? 'John',
    lastName: overrides.lastName ?? 'Doe',
    email: overrides.email ?? 'john.doe@example.com',
    dni: overrides.dni ?? '12345678',
    role: overrides.role ?? makeRoleReference(overrides.roleLevel !== undefined ? { level: overrides.roleLevel } : {}),
    ...(overrides.phone !== undefined && { phone: overrides.phone }),
    ...(overrides.address !== undefined && { address: overrides.address }),
    ...(overrides.photoUrl !== undefined && { photoUrl: overrides.photoUrl }),
});

export const makeExistingUserProps = (overrides: ExistingUserPropsOverrides = {}) => ({
    ...makeUserProps(overrides),
    password: overrides.password ?? 'hashed_password',
    isTemporaryPassword: overrides.isTemporaryPassword ?? false,
    status: overrides.status ?? UserStatus.ACTIVE,
});

export const makeUserEntity = (overrides: ExistingUserPropsOverrides = {}): UserEntity => {
    return UserEntity.fromExisting(
        overrides.id ?? 'user-id-123',
        makeExistingUserProps(overrides),
        overrides.createdAt ?? new Date('2024-01-01')
    ).value();
};
