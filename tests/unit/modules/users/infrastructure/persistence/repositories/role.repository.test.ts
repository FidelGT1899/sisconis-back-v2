import { type DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { RoleRepository } from '@users-infrastructure/persistence/repositories/role.repository';
import { InfrastructureError } from '@shared-kernel/errors/infrastructure.error';
import { RoleEntity } from '@users-domain/entities/role.entity';
import { PrismaService } from '@shared-infrastructure/database/prisma/prisma.service';

import { makePrismaRole } from '@tests-factories/users/mocks';

describe('RoleRepository', () => {
    let roleRepository: RoleRepository;
    let prismaMock: DeepMockProxy<PrismaClient>;
    let prismaServiceMock: DeepMockProxy<PrismaService>;

    beforeEach(() => {
        prismaMock = mockDeep<PrismaClient>();
        prismaServiceMock = mockDeep<PrismaService>();
        prismaServiceMock.getClient.mockReturnValue(prismaMock);
        roleRepository = new RoleRepository(prismaServiceMock);
    });

    describe('existsByName', () => {
        it('should return true if role exists', async () => {
            prismaMock.role.findFirst.mockResolvedValue(makePrismaRole());

            const result = await roleRepository.existsByName('Admin');

            expect(result).toBe(true);
            expect(prismaMock.role.findFirst).toHaveBeenCalledWith({
                where: { name: 'Admin', deletedAt: null },
                select: { id: true },
            });
        });

        it('should return false if role does not exist', async () => {
            prismaMock.role.findFirst.mockResolvedValue(null);

            const result = await roleRepository.existsByName('NonExistent');

            expect(result).toBe(false);
        });

        it('should throw InfrastructureError when prisma fails', async () => {
            prismaMock.role.findFirst.mockRejectedValue(new Error('DB failure'));

            await expect(roleRepository.existsByName('Admin')).rejects.toThrow(InfrastructureError);
        });
    });

    describe('existsByLevel', () => {
        it('should return true if role with level exists', async () => {
            prismaMock.role.findFirst.mockResolvedValue(makePrismaRole());

            const result = await roleRepository.existsByLevel(7);

            expect(result).toBe(true);
            expect(prismaMock.role.findFirst).toHaveBeenCalledWith({
                where: { level: 7, deletedAt: null },
                select: { id: true },
            });
        });

        it('should return false if no role with level exists', async () => {
            prismaMock.role.findFirst.mockResolvedValue(null);

            const result = await roleRepository.existsByLevel(99);

            expect(result).toBe(false);
        });

        it('should throw InfrastructureError when prisma fails', async () => {
            prismaMock.role.findFirst.mockRejectedValue(new Error('DB failure'));

            await expect(roleRepository.existsByLevel(7)).rejects.toThrow(InfrastructureError);
        });
    });

    describe('findById', () => {
        it('should return RoleEntity when found', async () => {
            prismaMock.role.findUnique.mockResolvedValue(makePrismaRole());

            const result = await roleRepository.findById('role-id-123');

            expect(result).toBeInstanceOf(RoleEntity);
            expect(result?.getId()).toBe('role-id-123');
            expect(prismaMock.role.findUnique).toHaveBeenCalledWith({
                where: { id: 'role-id-123', deletedAt: null },
            });
        });

        it('should return null when role does not exist', async () => {
            prismaMock.role.findUnique.mockResolvedValue(null);

            const result = await roleRepository.findById('non-existent');

            expect(result).toBeNull();
        });

        it('should throw InfrastructureError when prisma fails', async () => {
            prismaMock.role.findUnique.mockRejectedValue(new Error('DB error'));

            await expect(roleRepository.findById('id')).rejects.toThrow(InfrastructureError);
        });
    });

    describe('index', () => {
        it('should return paginated roles', async () => {
            prismaMock.$transaction.mockResolvedValue([
                [makePrismaRole()],
                1,
            ]);

            const result = await roleRepository.index({
                page: 1,
                limit: 10,
                orderBy: 'createdAt',
                direction: 'desc',
                search: '',
            });

            expect(result.total).toBe(1);
            expect(result.items).toHaveLength(1);
            expect(result.items[0]).toBeInstanceOf(RoleEntity);
            expect(result.items[0]?.getId()).toBe('role-id-123');
        });

        it('should use default pagination when not provided', async () => {
            prismaMock.$transaction.mockResolvedValue([[], 0]);

            const result = await roleRepository.index();

            expect(result.total).toBe(0);
            expect(result.items).toHaveLength(0);
        });

        it('should throw InfrastructureError when prisma fails', async () => {
            prismaMock.$transaction.mockRejectedValue(new Error('DB down'));

            await expect(roleRepository.index()).rejects.toThrow(InfrastructureError);
        });

        it('should apply search filter when provided', async () => {
            prismaMock.$transaction.mockResolvedValue([[], 0]);

            await roleRepository.index({
                page: 1,
                limit: 10,
                orderBy: 'name',
                direction: 'asc',
                search: 'admin',
            });

            expect(prismaMock.role.findMany).toHaveBeenCalledWith({
                where: {
                    deletedAt: null,
                    OR: [{ name: { contains: 'admin', mode: 'insensitive' } }],
                },
                orderBy: { name: 'asc' },
                skip: 0,
                take: 10,
            });
            expect(prismaMock.role.count).toHaveBeenCalledWith({
                where: {
                    deletedAt: null,
                    OR: [{ name: { contains: 'admin', mode: 'insensitive' } }],
                },
            });
        });

        it('should pass custom pagination and soft-delete filter without search', async () => {
            prismaMock.$transaction.mockResolvedValue([[], 0]);

            await roleRepository.index({
                page: 2,
                limit: 4,
                orderBy: 'name',
                direction: 'desc',
            });

            expect(prismaMock.role.findMany).toHaveBeenCalledWith({
                where: { deletedAt: null },
                orderBy: { name: 'desc' },
                skip: 4,
                take: 4,
            });
        });
    });

    describe('save', () => {
        it('should create and return a RoleEntity', async () => {
            prismaMock.role.create.mockResolvedValue(makePrismaRole());

            const role = RoleEntity.rehydrate({
                id: 'role-id-123',
                name: 'Admin',
                description: 'Administrator role',
                level: 7,
                createdAt: new Date('2024-01-01'),
            });

            const result = await roleRepository.save(role);

            expect(result).toBeInstanceOf(RoleEntity);
            expect(result.getId()).toBe('role-id-123');
            expect(prismaMock.role.create).toHaveBeenCalled();
            const createArg = prismaMock.role.create.mock.calls[0]?.[0];
            expect(createArg?.data).toEqual(
                expect.objectContaining({
                    id: 'role-id-123',
                    name: 'Admin',
                    level: 7,
                })
            );
        });

        it('should throw InfrastructureError when create fails', async () => {
            prismaMock.role.create.mockRejectedValue(new Error('DB error'));

            const role = RoleEntity.rehydrate({
                id: 'role-id-123',
                name: 'Admin',
                description: null,
                level: 7,
                createdAt: new Date(),
            });

            await expect(roleRepository.save(role)).rejects.toThrow(InfrastructureError);
        });
    });

    describe('update', () => {
        it('should update and return RoleEntity', async () => {
            prismaMock.role.update.mockResolvedValue(makePrismaRole());

            const role = RoleEntity.rehydrate({
                id: 'role-id-123',
                name: 'Admin',
                description: 'Administrator role',
                level: 7,
                createdAt: new Date('2024-01-01'),
            });

            const result = await roleRepository.update(role);

            expect(result).toBeInstanceOf(RoleEntity);
            expect(prismaMock.role.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'role-id-123' },
                })
            );
            const updateArg = prismaMock.role.update.mock.calls[0]?.[0];
            expect(updateArg?.data).toEqual(
                expect.objectContaining({
                    name: 'Admin',
                    level: 7,
                })
            );
        });

        it('should throw InfrastructureError when update fails', async () => {
            prismaMock.role.update.mockRejectedValue(new Error('DB error'));

            const role = RoleEntity.rehydrate({
                id: 'role-id-123',
                name: 'Admin',
                description: null,
                level: 7,
                createdAt: new Date(),
            });

            await expect(roleRepository.update(role)).rejects.toThrow(InfrastructureError);
        });
    });

    describe('delete', () => {
        it('should soft delete role by setting deletedAt', async () => {
            prismaMock.role.update.mockResolvedValue(makePrismaRole());

            await roleRepository.delete('role-id-123');

            expect(prismaMock.role.update).toHaveBeenCalledTimes(1);
            const callArg = prismaMock.role.update.mock.calls[0]?.[0];
            expect(callArg?.where).toEqual({ id: 'role-id-123', deletedAt: null });
            expect(callArg?.data.deletedAt).toBeInstanceOf(Date);
        });

        it('should throw InfrastructureError when delete fails', async () => {
            prismaMock.role.update.mockRejectedValue(new Error('DB error'));

            await expect(roleRepository.delete('role-id-123')).rejects.toThrow(InfrastructureError);
        });
    });
});
