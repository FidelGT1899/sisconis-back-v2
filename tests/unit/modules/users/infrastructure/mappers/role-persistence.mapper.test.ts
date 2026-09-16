import { RoleMapper } from '@users-infrastructure/mappers/role-persistence.mapper';
import { RoleEntity } from '@users-domain/entities/role.entity';

const makePrismaRole = (overrides = {}) => ({
    id: 'role-id-123',
    name: 'Admin',
    description: 'Administrator role',
    level: 7,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
    ...overrides,
});

describe('RoleMapper', () => {
    describe('toDomain', () => {
        it('should map prisma role to RoleEntity', () => {
            const prismaRole = makePrismaRole();

            const entity = RoleMapper.toDomain(prismaRole);

            expect(entity).toBeInstanceOf(RoleEntity);
            expect(entity.getId()).toBe('role-id-123');
            expect(entity.getName()).toBe('Admin');
            expect(entity.getDescription()).toBe('Administrator role');
            expect(entity.getLevel()).toBe(7);
        });

        it('should handle null description', () => {
            const prismaRole = makePrismaRole({ description: null });

            const entity = RoleMapper.toDomain(prismaRole);

            expect(entity.getDescription()).toBeNull();
        });

        it('should handle null deletedAt', () => {
            const prismaRole = makePrismaRole({ deletedAt: null });

            const entity = RoleMapper.toDomain(prismaRole);

            expect(entity).toBeInstanceOf(RoleEntity);
        });
    });

    describe('toPersistence', () => {
        it('should map RoleEntity to prisma role model', () => {
            const entity = RoleEntity.rehydrate({
                id: 'role-id-123',
                name: 'Admin',
                description: 'Administrator role',
                level: 7,
                createdAt: new Date('2024-01-01'),
            });

            const prismaModel = RoleMapper.toPersistence(entity);

            expect(prismaModel.id).toBe('role-id-123');
            expect(prismaModel.name).toBe('Admin');
            expect(prismaModel.description).toBe('Administrator role');
            expect(prismaModel.level).toBe(7);
            expect(prismaModel.createdAt).toBeInstanceOf(Date);
        });

        it('should handle null description', () => {
            const entity = RoleEntity.rehydrate({
                id: 'role-id-123',
                name: 'Admin',
                description: null,
                level: 7,
                createdAt: new Date('2024-01-01'),
            });

            const prismaModel = RoleMapper.toPersistence(entity);

            expect(prismaModel.description).toBeNull();
        });
    });
});
