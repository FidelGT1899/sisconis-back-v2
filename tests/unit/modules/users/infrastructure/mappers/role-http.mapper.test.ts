import { RoleHttpMapper } from '@users-infrastructure/mappers/role-http.mapper';
import type { ReadRoleDto } from '@users-application/dtos/role/read-role.dto';

describe('RoleHttpMapper', () => {
    describe('toResponse', () => {
        it('should map ReadRoleDto to HTTP response', () => {
            const dto: ReadRoleDto = {
                id: 'role-123',
                name: 'Admin',
                description: 'Administrator role',
                level: 7,
                createdAt: new Date('2024-01-01T00:00:00.000Z'),
                updatedAt: new Date('2024-06-15T12:00:00.000Z'),
            };

            const result = RoleHttpMapper.toResponse(dto);

            expect(result).toEqual({
                id: 'role-123',
                name: 'Admin',
                description: 'Administrator role',
                level: 7,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-06-15T12:00:00.000Z',
            });
        });

        it('should use createdAt as fallback for updatedAt', () => {
            const dto: ReadRoleDto = {
                id: 'role-123',
                name: 'Admin',
                level: 7,
                createdAt: new Date('2024-01-01T00:00:00.000Z'),
            };

            const result = RoleHttpMapper.toResponse(dto);

            expect(result.updatedAt).toBe('2024-01-01T00:00:00.000Z');
        });

        it('should handle undefined description', () => {
            const dto: ReadRoleDto = {
                id: 'role-123',
                name: 'Admin',
                level: 7,
                createdAt: new Date('2024-01-01'),
            };

            const result = RoleHttpMapper.toResponse(dto);

            expect(result.description).toBeUndefined();
        });
    });
});
