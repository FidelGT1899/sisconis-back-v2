import { GetUserUseCase } from "./get-user.use-case";
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

describe('GetUserUseCase', () => {
    let useCase: GetUserUseCase;
    let mockUserRepository: jest.Mocked<IUserRepository>;

    beforeEach(() => {
        mockUserRepository = {
            find: jest.fn(),
        } as jest.Mocked<IUserRepository>;

        useCase = new GetUserUseCase(mockUserRepository);
    });

    it('should return a user when it exists', async () => {
        const userId = 'test-user-id';
        mockUserRepository.find.mockResolvedValue(user);

        const result = await useCase.execute(userId);

        expect(result.isOk()).toBe(true);
        expect(result.value()).toBe(user);
        expect(mockUserRepository.find).toHaveBeenCalledWith(userId);
    });

    it('should return UserNotFoundError when user does not exist', async () => {
        const userId = 'non-existent-id';
        mockUserRepository.find.mockResolvedValue(null);

        const result = await useCase.execute(userId);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.find).toHaveBeenCalledWith(userId);
    });
});
