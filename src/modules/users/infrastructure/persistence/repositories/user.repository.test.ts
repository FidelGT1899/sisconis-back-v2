import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { PrismaClient } from "@prisma-generated";
import { UserRepository } from "./user.repository";
import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";
import { UserEntity } from "@users-domain/entities/user.entity";

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
});
