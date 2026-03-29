import { mock } from 'jest-mock-extended';
import type { IEntityIdGenerator } from '@shared-domain/ports/id-generator';
import type { IPasswordHasher } from '@shared-domain/ports/password-hasher';
import type { IUserRepository } from '@users-domain/repositories/user.repository.interface';
import type { IRoleRepository } from '@users-domain/repositories/role.repository.interface';
import { UserStatus } from '@users-domain/entities/user.entity';
import { RoleStatus } from '@users-domain/entities/role.entity';

export const makeMockIdGenerator = () => {
    const m = mock<IEntityIdGenerator>();
    m.generate.mockReturnValue('mock-uuid-12345');
    return m;
};

export const makeMockPasswordHasher = () => {
    const m = mock<IPasswordHasher>();
    m.hash.mockResolvedValue('hashed_password');
    m.compare.mockResolvedValue(true);
    return m;
};

export const makePrismaUser = (overrides = {}) => ({
    id: 'user-id-123',
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    dni: '12345678',
    password: 'hashed_password',
    isPasswordTemporary: false,
    status: UserStatus.ACTIVE,
    phone: null,
    address: null,
    photoUrl: null,
    roleId: 'role-id-123',
    role: {
        id: 'role-id-123',
        name: 'Admin',
        description: null,
        status: RoleStatus.ACTIVE,
        level: 7,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        deletedAt: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
    ...overrides
});

export const asUnknown = (value: unknown) => value;

export const makeMockUserRepository = () => mock<IUserRepository>();
export const makeMockRoleRepository = () => mock<IRoleRepository>();
