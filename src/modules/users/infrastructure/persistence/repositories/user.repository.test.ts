import { type DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./user.repository";
import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";
import { UserEntity } from "@users-domain/entities/user.entity";
import { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";

import { makePrismaUser } from "@users-tests/factories/mocks";
import { makeUserEntity } from "@users-tests/factories/user.factory";

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let prismaMock: DeepMockProxy<PrismaClient>;
    let prismaServiceMock: DeepMockProxy<PrismaService>;

    beforeEach(() => {
        prismaMock = mockDeep<PrismaClient>();
        prismaServiceMock = mockDeep<PrismaService>();
        prismaServiceMock.getClient.mockReturnValue(prismaMock);
        userRepository = new UserRepository(prismaServiceMock);
    });

    describe("existsByEmail", () => {
        it("should return true if user exists", async () => {
            prismaMock.user.findFirst.mockResolvedValue(makePrismaUser());

            const result = await userRepository.existsByEmail("john.doe@example.com");

            expect(result).toBe(true);
            expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
                where: { email: "john.doe@example.com", deletedAt: null },
                select: { id: true }
            });
        });

        it("should return false if user does not exist", async () => {
            prismaMock.user.findFirst.mockResolvedValue(null);

            const result = await userRepository.existsByEmail("new@example.com");

            expect(result).toBe(false);
        });

        it("should throw InfrastructureError when prisma fails", async () => {
            prismaMock.user.findFirst.mockRejectedValue(new Error("Connection failure"));

            await expect(userRepository.existsByEmail("any@test.com"))
                .rejects.toThrow(InfrastructureError);
        });
    });

    describe("existsByDni", () => {
        it("should return true if user exists", async () => {
            prismaMock.user.findFirst.mockResolvedValue(makePrismaUser());

            const result = await userRepository.existsByDni("12345678");

            expect(result).toBe(true);
            expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
                where: { dni: "12345678", deletedAt: null },
                select: { id: true }
            });
        });

        it("should return false if user does not exist", async () => {
            prismaMock.user.findFirst.mockResolvedValue(null);

            const result = await userRepository.existsByDni("99999999");

            expect(result).toBe(false);
        });
    });

    describe("existsByRoleId", () => {
        it("should return true if users with role exist", async () => {
            prismaMock.user.findFirst.mockResolvedValue(makePrismaUser());

            const result = await userRepository.existsByRoleId("role-id-123");

            expect(result).toBe(true);
        });

        it("should return false if no users with role exist", async () => {
            prismaMock.user.findFirst.mockResolvedValue(null);

            const result = await userRepository.existsByRoleId("role-id-123");

            expect(result).toBe(false);
        });
    });

    describe("existsByEmailExcluding", () => {
        it("should return true if another user has the email", async () => {
            prismaMock.user.findFirst.mockResolvedValue(makePrismaUser());

            const result = await userRepository.existsByEmailExcluding(
                "john.doe@example.com",
                "other-id"
            );

            expect(result).toBe(true);
            expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
                where: {
                    email: "john.doe@example.com",
                    deletedAt: null,
                    NOT: { id: "other-id" }
                },
                select: { id: true }
            });
        });

        it("should return false if no other user has the email", async () => {
            prismaMock.user.findFirst.mockResolvedValue(null);

            const result = await userRepository.existsByEmailExcluding(
                "john.doe@example.com",
                "user-id-123"
            );

            expect(result).toBe(false);
        });
    });

    describe("existsByDniExcluding", () => {
        it("should return true if another user has the DNI", async () => {
            prismaMock.user.findFirst.mockResolvedValue(makePrismaUser());

            const result = await userRepository.existsByDniExcluding(
                "12345678",
                "other-id"
            );

            expect(result).toBe(true);
        });

        it("should return false if no other user has the DNI", async () => {
            prismaMock.user.findFirst.mockResolvedValue(null);

            const result = await userRepository.existsByDniExcluding(
                "12345678",
                "user-id-123"
            );

            expect(result).toBe(false);
        });
    });

    describe('index', () => {
        it('should return paginated users mapped to domain', async () => {
            prismaMock.$transaction.mockResolvedValue([
                [makePrismaUser()],
                1
            ]);

            const result = await userRepository.index({
                page: 1,
                limit: 10,
                orderBy: 'createdAt',
                direction: 'desc',
                search: 'John'
            });

            expect(result.total).toBe(1);
            expect(result.items).toHaveLength(1);
            expect(result.items[0]).toBeInstanceOf(UserEntity);
            expect(result.items[0]?.getId()).toBe('user-id-123');
        });

        it('should use default pagination when not provided', async () => {
            prismaMock.$transaction.mockResolvedValue([[], 0]);

            const result = await userRepository.index();

            expect(result.total).toBe(0);
            expect(result.items).toHaveLength(0);
        });

        it('should throw InfrastructureError when prisma fails', async () => {
            prismaMock.$transaction.mockRejectedValue(new Error('DB down'));

            await expect(userRepository.index()).rejects.toThrow(InfrastructureError);
        });
    });

    describe('findById', () => {
        it('should return UserEntity when found', async () => {
            prismaMock.user.findUnique.mockResolvedValue(makePrismaUser());

            const result = await userRepository.findById('user-id-123');

            expect(result).toBeInstanceOf(UserEntity);
            expect(result?.getId()).toBe('user-id-123');
            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user-id-123', deletedAt: null },
                include: { role: true }
            });
        });

        it('should return null when user does not exist', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            const result = await userRepository.findById('non-existent');

            expect(result).toBeNull();
        });

        it('should throw InfrastructureError when prisma fails', async () => {
            prismaMock.user.findUnique.mockRejectedValue(new Error('DB error'));

            await expect(userRepository.findById('id')).rejects.toThrow(InfrastructureError);
        });
    });

    describe("save", () => {
        it("should create and return a UserEntity", async () => {
            const user = makeUserEntity();
            prismaMock.user.create.mockResolvedValue(makePrismaUser());

            const result = await userRepository.save(user);

            expect(result).toBeInstanceOf(UserEntity);
            expect(result.getId()).toBe('user-id-123');
            expect(prismaMock.user.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: { role: true }
                })
            );
        });

        it("should throw InfrastructureError when create fails", async () => {
            const user = makeUserEntity();
            prismaMock.user.create.mockRejectedValue(new Error("DB error"));

            await expect(userRepository.save(user)).rejects.toThrow(InfrastructureError);
        });
    });

    describe('update', () => {
        it('should update and return UserEntity', async () => {
            const user = makeUserEntity();
            prismaMock.user.update.mockResolvedValue(makePrismaUser());

            const result = await userRepository.update(user);

            expect(result).toBeInstanceOf(UserEntity);
            expect(prismaMock.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: user.getId() },
                    include: { role: true }
                })
            );
        });

        it('should throw InfrastructureError when update fails', async () => {
            const user = makeUserEntity();
            prismaMock.user.update.mockRejectedValue(new Error('DB error'));

            await expect(userRepository.update(user)).rejects.toThrow(InfrastructureError);
        });
    });

    describe('delete', () => {
        it('should soft delete user by setting deletedAt', async () => {
            prismaMock.user.update.mockResolvedValue(makePrismaUser());

            await userRepository.delete('user-id-123');

            expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
            const callArg = prismaMock.user.update.mock.calls[0]?.[0];
            expect(callArg?.where).toEqual({ id: 'user-id-123', deletedAt: null });
            expect(callArg?.data.deletedAt).toBeInstanceOf(Date);
        });

        it('should throw InfrastructureError when delete fails', async () => {
            prismaMock.user.update.mockRejectedValue(new Error('DB error'));

            await expect(userRepository.delete('user-id-123')).rejects.toThrow(InfrastructureError);
        });
    });
});
