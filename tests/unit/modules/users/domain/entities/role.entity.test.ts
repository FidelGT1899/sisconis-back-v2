import { RoleEntity } from '@users-domain/entities/role.entity';
import { InvalidRoleLevelError } from '@users-domain/errors/invalid-role-level.error';

describe('RoleEntity', () => {
    const validProps = {
        id: 'role-id-123',
        name: 'Admin',
        description: 'Administrator role',
        level: 7,
        createdAt: new Date('2024-01-01'),
    };

    describe('rehydrate', () => {
        it('should rehydrate a role from primitives', () => {
            const role = RoleEntity.rehydrate(validProps);
            expect(role.getId()).toBe(validProps.id);
            expect(role.getName()).toBe(validProps.name);
            expect(role.getDescription()).toBe(validProps.description);
            expect(role.getLevel()).toBe(validProps.level);
        });

        it('should rehydrate with null description', () => {
            const role = RoleEntity.rehydrate({ ...validProps, description: null });
            expect(role.getDescription()).toBeNull();
        });
    });

    describe('updateDetails', () => {
        it('should update name and description', () => {
            const role = RoleEntity.rehydrate(validProps);

            role.updateDetails('Super Admin', 'Super administrator');

            expect(role.getName()).toBe('Super Admin');
            expect(role.getDescription()).toBe('Super administrator');
            expect(role.updatedAt).toBeInstanceOf(Date);
        });

        it('should allow setting description to null', () => {
            const role = RoleEntity.rehydrate(validProps);
            role.updateDetails('New Name', null);
            expect(role.getName()).toBe('New Name');
            expect(role.getDescription()).toBeNull();
        });
    });

    describe('updateHierarchy', () => {
        it('should update level when positive', () => {
            const role = RoleEntity.rehydrate(validProps);
            const result = role.updateHierarchy(10);
            expect(result.isOk()).toBe(true);
            expect(role.getLevel()).toBe(10);
        });

        it('should fail when level is 0', () => {
            const role = RoleEntity.rehydrate(validProps);
            const result = role.updateHierarchy(0);
            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidRoleLevelError);
            expect(role.getLevel()).toBe(validProps.level);
        });

        it('should fail when level is negative', () => {
            const role = RoleEntity.rehydrate(validProps);
            const result = role.updateHierarchy(-5);
            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidRoleLevelError);
            expect(role.getLevel()).toBe(validProps.level);
        });

        it('should update updatedAt when level changes', () => {
            const role = RoleEntity.rehydrate(validProps);
            role.updateHierarchy(3);
            expect(role.updatedAt).toBeInstanceOf(Date);
        });
    });
});
