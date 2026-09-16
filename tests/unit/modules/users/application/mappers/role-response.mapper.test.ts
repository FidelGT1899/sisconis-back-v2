import { RoleResponseMapper } from '@users-application/mappers/role-response.mapper';
import { RoleEntity } from '@users-domain/entities/role.entity';

const makeRoleEntity = (overrides = {}) =>
    RoleEntity.rehydrate({
        id: 'role-id-123',
        name: 'Admin',
        description: 'Administrator role',
        level: 7,
        createdAt: new Date('2024-01-01'),
        ...overrides,
    });

describe('RoleResponseMapper', () => {
    describe('toDto', () => {
        it('should map RoleEntity to ReadRoleDto', () => {
            const role = makeRoleEntity();

            const dto = RoleResponseMapper.toDto(role);

            expect(dto.id).toBe('role-id-123');
            expect(dto.name).toBe('Admin');
            expect(dto.description).toBe('Administrator role');
            expect(dto.level).toBe(7);
            expect(dto.createdAt).toBeInstanceOf(Date);
        });

        it('should include description when present', () => {
            const role = makeRoleEntity({ description: 'Administrator role' });

            const dto = RoleResponseMapper.toDto(role);

            expect(dto).toHaveProperty('description', 'Administrator role');
        });

        it('should omit description when null', () => {
            const role = makeRoleEntity({ description: null });

            const dto = RoleResponseMapper.toDto(role);

            expect(dto).not.toHaveProperty('description');
        });

        it('should include updatedAt when present', () => {
            const updatedAt = new Date('2024-02-01');
            const role = makeRoleEntity({ updatedAt });

            const dto = RoleResponseMapper.toDto(role);

            expect(dto.updatedAt).toBe(updatedAt);
        });
    });
});