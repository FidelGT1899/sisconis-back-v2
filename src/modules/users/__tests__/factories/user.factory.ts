import { UserEntity, UserStatus } from '@users-domain/entities/user.entity';
import { makeRoleReference } from './role.factory';

interface UserPropsOverrides {
    name?: string;
    lastName?: string;
    email?: string;
    dni?: string;
}

interface ExistingUserPropsOverrides extends UserPropsOverrides {
    password?: string;
    isTemporaryPassword?: boolean;
    status?: UserStatus;
}

export const makeUserProps = (overrides: UserPropsOverrides = {}) => ({
    name: overrides.name ?? 'John',
    lastName: overrides.lastName ?? 'Doe',
    email: overrides.email ?? 'john.doe@example.com',
    dni: overrides.dni ?? '12345678',
    role: makeRoleReference(),
});

export const makeExistingUserProps = (overrides: ExistingUserPropsOverrides = {}) => ({
    ...makeUserProps(overrides),
    password: overrides.password ?? 'hashed_password',
    isTemporaryPassword: overrides.isTemporaryPassword ?? false,
    status: overrides.status ?? UserStatus.ACTIVE,
});

export const makeUserEntity = (overrides: ExistingUserPropsOverrides = {}): UserEntity => {
    return UserEntity.fromExisting(
        'user-id-123',
        makeExistingUserProps(overrides),
        new Date('2024-01-01')
    ).value();
};
