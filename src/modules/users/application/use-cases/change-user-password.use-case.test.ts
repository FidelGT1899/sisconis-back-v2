import { ChangeUserPasswordUseCase } from "./change-user-password.use-case";
import { UserNotFoundError } from "../errors/user-not-found.error";
import { UserEntity } from "@users-domain/entities/user.entity";
import { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { IEntityIdGenerator } from "@shared-domain/ports/id-generator";
import { IPasswordHasher } from "@shared-domain/ports/password-hasher";

const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
} as jest.Mocked<IUserRepository>;

const mockIdGenerator: jest.Mocked<IEntityIdGenerator> = {
    generate: jest.fn(),
};

const mockPasswordHasher: jest.Mocked<IPasswordHasher> = {
    hash: jest.fn(),
};

describe('ChangeUserPasswordUseCase', () => {
    let useCase: ChangeUserPasswordUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new ChangeUserPasswordUseCase(mockUserRepository, mockPasswordHasher);
    });

    it('should change password and update status to NOT temporary', async () => {
        mockIdGenerator.generate.mockReturnValue('user-123');

        const userResult = await UserEntity.create({
            name: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
            dni: '12345678'
        }, mockIdGenerator, mockPasswordHasher);

        if (userResult.isErr()) throw new Error('Setup failed');
        const userEntity = userResult.value();

        mockPasswordHasher.hash.mockResolvedValue('hashed_12345678');
        mockUserRepository.findById.mockResolvedValue(userEntity);
        mockUserRepository.update.mockImplementation((u: UserEntity) => Promise.resolve(u));

        const dto = { id: 'user-123', newPassword: 'Password123' };

        const result = await useCase.execute(dto);

        expect(result.isOk()).toBe(true);
        const updatedUser = result.value();

        expect(updatedUser.isPasswordTemporary()).toBe(false);
        expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it('should return UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({ id: 'non-existent', newPassword: 'password123' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
    });
});
