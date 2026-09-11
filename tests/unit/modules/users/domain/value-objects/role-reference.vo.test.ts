import { RoleReferenceVO } from '@users-domain/value-objects/role-reference.vo';
import { InvalidRoleReferenceError } from '@users-domain/errors/invalid-role-reference.error';

describe('RoleReferenceVO', () => {
    const validProps = {
        id: 'role-id-123',
        name: 'Admin',
        level: 7,
    };

    describe('create', () => {
        it('should create a valid RoleReferenceVO', () => {
            const result = RoleReferenceVO.create(validProps);
            expect(result.isOk()).toBe(true);
            expect(result.value().getId()).toBe(validProps.id);
            expect(result.value().getName()).toBe(validProps.name);
            expect(result.value().getLevel()).toBe(validProps.level);
        });

        it('should fail when id is empty', () => {
            const result = RoleReferenceVO.create({ ...validProps, id: '' });
            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidRoleReferenceError);
        });

        it('should fail when id is whitespace only', () => {
            const result = RoleReferenceVO.create({ ...validProps, id: '   ' });
            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidRoleReferenceError);
        });

        it('should fail when name is empty', () => {
            const result = RoleReferenceVO.create({ ...validProps, name: '' });
            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidRoleReferenceError);
        });

        it('should fail when name is whitespace only', () => {
            const result = RoleReferenceVO.create({ ...validProps, name: '   ' });
            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidRoleReferenceError);
        });

        it('should fail when level is 0', () => {
            const result = RoleReferenceVO.create({ ...validProps, level: 0 });
            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidRoleReferenceError);
        });

        it('should fail when level is negative', () => {
            const result = RoleReferenceVO.create({ ...validProps, level: -1 });
            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidRoleReferenceError);
        });

        it('should accept level of 1 (minimum positive)', () => {
            const result = RoleReferenceVO.create({ ...validProps, level: 1 });
            expect(result.isOk()).toBe(true);
            expect(result.value().getLevel()).toBe(1);
        });
    });

    describe('canManageLevel', () => {
        it('should return true when my level is greater than target', () => {
            const vo = RoleReferenceVO.create({ ...validProps, level: 10 }).value();
            expect(vo.canManageLevel(5)).toBe(true);
        });

        it('should return false when my level equals target', () => {
            const vo = RoleReferenceVO.create({ ...validProps, level: 5 }).value();
            expect(vo.canManageLevel(5)).toBe(false);
        });

        it('should return false when my level is less than target', () => {
            const vo = RoleReferenceVO.create({ ...validProps, level: 3 }).value();
            expect(vo.canManageLevel(5)).toBe(false);
        });
    });

    describe('equality', () => {
        it('should be equal when id matches', () => {
            const vo1 = RoleReferenceVO.create(validProps).value();
            const vo2 = RoleReferenceVO.create({ ...validProps, name: 'Other', level: 1 }).value();
            expect(vo1.equals(vo2)).toBe(true);
        });

        it('should not be equal when id differs', () => {
            const vo1 = RoleReferenceVO.create(validProps).value();
            const vo2 = RoleReferenceVO.create({ ...validProps, id: 'other-id' }).value();
            expect(vo1.equals(vo2)).toBe(false);
        });
    });
});
