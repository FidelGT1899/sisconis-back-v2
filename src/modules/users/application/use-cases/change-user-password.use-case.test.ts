import { ChangeUserPasswordUseCase } from "./change-user-password.use-case";
import { UserNotFoundError } from "../errors/user-not-found.error";
import { UserEntity } from "@users-domain/entities/user.entity";
import { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { IIdGenerator } from "@shared-domain/ports/id-generator";

const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
} as jest.Mocked<IUserRepository>;

const mockIdGenerator: jest.Mocked<IIdGenerator> = {
    generate: jest.fn(),
};

describe('ChangeUserPasswordUseCase', () => {
    let useCase: ChangeUserPasswordUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new ChangeUserPasswordUseCase(mockUserRepository);
    });

    it('should change password and update status to NOT temporary', async () => {
        mockIdGenerator.generate.mockReturnValue('user-123');

        const userResult = UserEntity.create({
            name: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
            dni: '12345678'
        }, mockIdGenerator);

        if (userResult.isErr()) throw new Error('Setup failed');
        const userEntity = userResult.value();

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
