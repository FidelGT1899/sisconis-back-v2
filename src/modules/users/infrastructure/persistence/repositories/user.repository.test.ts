import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient, User } from "@prisma-generated";
import { UserRepository } from "./user.repository";
import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";
import { UserEntity } from "@users-domain/entities/user.entity";
import { EmailVO } from "@users-domain/value-objects/email.vo";
import { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let prismaMock: DeepMockProxy<PrismaClient>;
    let prismaServiceMock: DeepMockProxy<PrismaService>;

    beforeEach(() => {
        prismaMock = mockDeep<PrismaClient>();
        prismaServiceMock = mockDeep<PrismaService>();

        prismaServiceMock.isConnected.mockResolvedValue(true);
        prismaServiceMock.getClient.mockReturnValue(prismaMock);

        userRepository = new UserRepository(prismaServiceMock);
    });

    describe("existsByEmail", () => {
        it("should return true if user count is greater than 0", async () => {
            prismaMock.user.count.mockResolvedValue(1);

            const result = await userRepository.existsByEmail("test@example.com");

            expect(result).toBe(true);
            expect(prismaMock.user.count).toHaveBeenCalledWith({
                where: { email: "test@example.com" }
            });
        });

        it("should return false if user count is 0", async () => {
            prismaMock.user.count.mockResolvedValue(0);

            const result = await userRepository.existsByEmail("new@example.com");

            expect(result).toBe(false);
        });

        it("should throw InfrastructureError when prisma fails", async () => {
            prismaMock.user.count.mockRejectedValue(new Error("Conn error"));

            await expect(userRepository.existsByEmail("any@test.com"))
                .rejects.toThrow(InfrastructureError);
        });
    });

    describe('index', () => {
        it('should return paginated users with filters applied', async () => {
            const prismaUsers = [{
                id: '1',
                name: 'Fidel',
                lastName: 'Garcia',
                email: 'fidel@test.com',
                password: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                createdBy: null,
                updatedBy: null,
                deletedBy: null
            }];

            prismaMock.$transaction.mockResolvedValue([
                prismaUsers,
                1
            ]);

            const result = await userRepository.index({
                page: 1,
                limit: 10,
                orderBy: 'createdAt',
                direction: 'desc',
                search: 'Fidel'
            });

            const user = result.items[0];
            expect(user).toBeInstanceOf(UserEntity);

            expect(user.getId()).toBe('1');
            expect(user.getName()).toBe('Fidel');
            expect(user.getLastName()).toBe('Garcia');

            expect(user.getEmail()).toBe('fidel@test.com');

            expect(user.getCreatedAt()).toBeInstanceOf(Date);

            expect(result.total).toBe(1);

        });

        it('should throw InfrastructureError when prisma fails', async () => {
            prismaMock.$transaction.mockRejectedValue(new Error('DB down'));

            await expect(
                userRepository.index({
                    page: 1,
                    limit: 10,
                    orderBy: 'createdAt',
                    direction: 'desc'
                })
            ).rejects.toThrow(InfrastructureError);

        });
    });

    describe('find', () => {
        it('should return user when found and not deleted', async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: 'id-1',
                name: 'Fidel',
                lastName: 'Garcia',
                email: 'fidel@test.com',
                password: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                createdBy: null,
                updatedBy: null,
                deletedBy: null
            });

            const result = await userRepository.find('id-1');

            expect(result).toBeInstanceOf(UserEntity);
            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'id-1', deletedAt: null }
            });
        });

        it('should return null when user does not exist', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            const result = await userRepository.find('nope');

            expect(result).toBeNull();
        });
    });

    describe("save", () => {
        it("should create and return a user entity correctly", async () => {
            const userEntityResult = UserEntity.create({
                name: "Fidel",
                lastName: "Test",
                email: "fidel@test.com",
                password: "hashed_password"
            }, { generate: () => "id-123" });

            const userEntity = userEntityResult.value();

            const prismaUser = {
                id: "id-123",
                name: "Fidel",
                lastName: "Test",
                email: "fidel@test.com",
                password: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                createdBy: null,
                updatedBy: null,
                deletedBy: null
            };

            prismaMock.user.create.mockResolvedValue(prismaUser);

            const result = await userRepository.save(userEntity);

            expect(result).toBeInstanceOf(UserEntity);
            expect(result.getId()).toBe("id-123");
            expect(result.getName()).toBe("Fidel");
            expect(result.getLastName()).toBe("Test");
            expect(result.getEmail()).toBe("fidel@test.com");

            expect(prismaMock.user.create).toHaveBeenCalledWith({
                data: {
                    id: "id-123",
                    name: "Fidel",
                    lastName: "Test",
                    email: "fidel@test.com",
                    password: "hashed_password",
                    createdAt: expect.any(Date) as unknown as Date,
                    updatedAt: expect.any(Date) as unknown as Date,
                    deletedAt: null,
                    createdBy: null,
                    updatedBy: null,
                    deletedBy: null
                }
            });
        });

        it("should throw InfrastructureError when create operation fails", async () => {
            const userEntityResult = UserEntity.create({
                name: "Error",
                lastName: "Test",
                email: "err@test.com",
                password: "pass"
            }, { generate: () => "id-err" });

            const userEntity = userEntityResult.value();

            prismaMock.user.create.mockRejectedValue(
                new Error("Database is not reachable")
            );

            await expect(userRepository.save(userEntity))
                .rejects.toThrow(InfrastructureError);

            await expect(userRepository.save(userEntity))
                .rejects.toThrow("Database is not reachable");
        });
    });

    describe('update', () => {
        it('should update and return the user', async () => {
            const email = EmailVO.create('fidel@test.com');
            if (email.isErr()) throw new Error('Invalid email');

            const user = UserEntity.rehydrate({
                id: 'id-1',
                name: 'Fidel',
                lastName: 'Old',
                email: email.value(),
                password: 'hashed',
                createdAt: new Date()
            });

            prismaMock.user.update.mockResolvedValue({
                id: 'id-1',
                name: 'Fidel',
                lastName: 'New',
                email: 'fidel@test.com',
                password: 'hashed',
                createdAt: user.createdAt,
                updatedAt: new Date(),
                deletedAt: null,
                createdBy: null,
                updatedBy: null,
                deletedBy: null
            });

            const result = await userRepository.update(user);

            expect(result).toBeInstanceOf(UserEntity);
            expect(prismaMock.user.update).toHaveBeenCalled();
        });
    });

    describe('delete', () => {
        const prismaUserMock: User = {
            id: 'id-1',
            name: 'Fidel',
            lastName: 'Garcia',
            email: 'fidel@test.com',
            password: 'hashed',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: new Date(),
            createdBy: null,
            updatedBy: null,
            deletedBy: null
        };

        it('should soft delete user', async () => {
            prismaMock.user.update.mockResolvedValue(prismaUserMock);
            await userRepository.delete('id-1');

            expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
            const callArg = prismaMock.user.update.mock.calls[0][0];
            expect(callArg.where).toEqual({
                id: 'id-1',
                deletedAt: null,
            });
            expect(callArg.data.deletedAt).toBeInstanceOf(Date);
        });


        it('should throw InfrastructureError when delete fails', async () => {
            prismaMock.user.update.mockRejectedValue(new Error('DB error'));

            await expect(userRepository.delete('id-1'))
                .rejects.toThrow(InfrastructureError);
        });
    });
});
