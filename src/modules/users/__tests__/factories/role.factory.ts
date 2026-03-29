import { RoleEntity, RoleStatus } from '@users-domain/entities/role.entity';
import type { RoleReferenceVO } from '@users-domain/value-objects/role-reference.vo';
import { RoleReferenceFactory } from '@users-application/factories/role-reference.factory';

export const makeRoleEntity = (overrides: Partial<{
    id: string;
    name: string;
    level: number;
    status: RoleStatus;
}> = {}): RoleEntity => {
    return RoleEntity.rehydrate({
        id: overrides.id ?? '550e8400-e29b-41d4-a716-446655440000',
        name: overrides.name ?? 'Admin',
        description: null,
        level: overrides.level ?? 7,
        status: overrides.status ?? RoleStatus.ACTIVE,
        createdAt: new Date('2024-01-01'),
    });
};

export const makeRoleReference = (overrides = {}): RoleReferenceVO => {
    const role = makeRoleEntity(overrides);
    return RoleReferenceFactory.fromRoleEntity(role).value();
};
