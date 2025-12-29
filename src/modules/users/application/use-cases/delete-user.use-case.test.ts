import { DeleteUserUseCase } from "./delete-user.use-case";
import { UserNotFoundError } from "../errors/user-not-found.error";
import { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";
import { EmailVO } from "@users-domain/value-objects/email.vo";


const user = UserEntity.rehydrate({
    id: 'test-user-id',
    name: 'John',
    lastName: 'Doe',
    email: EmailVO.create('john@doe.com'),
    password: 'hashed',
    createdAt: new Date(),
});

describe('DeleteUserUseCase', () => {
    let useCase: DeleteUserUseCase;
    let mockUserRepository: jest.Mocked<IUserRepository>;

    beforeEach(() => {
        mockUserRepository = {
            find: jest.fn(),
            delete: jest.fn(),
        } as jest.Mocked<IUserRepository>;

        useCase = new DeleteUserUseCase(mockUserRepository);
    });

    it('should delete a user when it exists', async () => {
        const userId = 'test-user-id';
        mockUserRepository.find.mockResolvedValue(user);

        const result = await useCase.execute(userId);

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
        expect(mockUserRepository.find).toHaveBeenCalledWith(userId);
        expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should return UserNotFoundError when user does not exist', async () => {
        const userId = 'non-existent-id';
        mockUserRepository.find.mockResolvedValue(null);

        const result = await useCase.execute(userId);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
});
