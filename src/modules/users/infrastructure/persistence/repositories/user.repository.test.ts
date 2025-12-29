import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient, User } from "@prisma-generated";
import { UserRepository } from "./user.repository";
import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";
import { UserEntity } from "@users-domain/entities/user.entity";
import { EmailVO } from "@users-domain/value-objects/email.vo";

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let prismaMock: DeepMockProxy<PrismaClient>;

    beforeEach(() => {
        prismaMock = mockDeep<PrismaClient>();
        userRepository = new UserRepository(prismaMock);
        jest.clearAllMocks();
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

            prismaMock.user.findMany.mockResolvedValue(prismaUsers);

            const result = await userRepository.index({
                page: 1,
                limit: 10,
                orderBy: 'createdAt',
                direction: 'desc',
                search: 'Fidel'
            });

            expect(prismaMock.user.findMany).toHaveBeenCalledWith({
                where: {
                    deletedAt: null,
                    OR: [
                        { name: { contains: 'Fidel', mode: 'insensitive' } },
                        { lastName: { contains: 'Fidel', mode: 'insensitive' } },
                        { email: { contains: 'Fidel', mode: 'insensitive' } }
                    ]
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip: 0,
                take: 10
            });

            expect(result[0]).toBeInstanceOf(UserEntity);
        });

        it('should throw InfrastructureError when prisma fails', async () => {
            prismaMock.user.findMany.mockRejectedValue(new Error('DB down'));

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
            const userEntity = UserEntity.create({
                name: "Fidel",
                lastName: "Test",
                email: "fidel@test.com",
                password: "hashed_password"
            }, { generate: () => "id-123" });

            const prismaUser = {
                id: "id-123",
                name: "Fidel",
                lastName: "Test",
                email: "fidel@test.com",
                password: "hashed_password",
                createdAt: new Date(),
                updatedAt: new Date()
            };
            prismaMock.user.create.mockResolvedValue(prismaUser);

            const result = await userRepository.save(userEntity);

            expect(result).toBeInstanceOf(UserEntity);
            expect(result.getId()).toBe("id-123");
            expect(prismaMock.user.create).toHaveBeenCalled();
        });

        it("should throw InfrastructureError when create operation fails", async () => {
            const userEntity = UserEntity.create({
                name: "Error",
                lastName: "Test",
                email: "err@test.com",
                password: "pass"
            }, { generate: () => "id-err" });

            prismaMock.user.create.mockRejectedValue(new Error("DB Fallo"));

            await expect(userRepository.save(userEntity))
                .rejects.toThrow(InfrastructureError);
        });
    });

    describe('update', () => {
        it('should update and return the user', async () => {
            const user = UserEntity.rehydrate({
                id: 'id-1',
                name: 'Fidel',
                lastName: 'Old',
                email: EmailVO.create('fidel@test.com'),
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
