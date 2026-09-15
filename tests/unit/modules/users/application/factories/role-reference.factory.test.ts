import { RoleReferenceFactory } from '@users-application/factories/role-reference.factory';
import { FailedToCreateRoleReferenceError } from '@users-application/errors/role/failed-to-create-role-reference.error';
import { RoleEntity } from '@users-domain/entities/role.entity';

describe('RoleReferenceFactory', () => {
    describe('fromRoleEntity', () => {
        it('should create a RoleReferenceVO from a valid role entity', () => {
            const role = RoleEntity.rehydrate({
                id: 'role-123',
                name: 'Admin',
                description: 'Administrator',
                level: 7,
                createdAt: new Date('2024-01-01'),
            });

            const result = RoleReferenceFactory.fromRoleEntity(role);

            expect(result.isOk()).toBe(true);
            expect(result.value().getId()).toBe('role-123');
            expect(result.value().getName()).toBe('Admin');
            expect(result.value().getLevel()).toBe(7);
        });

        it('should create a RoleReferenceVO with null description', () => {
            const role = RoleEntity.rehydrate({
                id: 'role-456',
                name: 'User',
                description: null,
                level: 3,
                createdAt: new Date('2024-01-01'),
            });

            const result = RoleReferenceFactory.fromRoleEntity(role);

            expect(result.isOk()).toBe(true);
            expect(result.value().getId()).toBe('role-456');
            expect(result.value().getName()).toBe('User');
            expect(result.value().getLevel()).toBe(3);
        });

        it('should propagate RoleReferenceVO creation errors as FailedToCreateRoleReferenceError', () => {
            const role = RoleEntity.rehydrate({
                id: 'role-123',
                name: '   ',
                description: null,
                level: 7,
                createdAt: new Date('2024-01-01'),
            });

            const result = RoleReferenceFactory.fromRoleEntity(role);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(FailedToCreateRoleReferenceError);
        });
    });
});
