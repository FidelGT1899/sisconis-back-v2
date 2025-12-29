import { UpdateUserUseCase } from "./update-user.use-case";
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

describe('UpdateUserUseCase', () => {
    let useCase: UpdateUserUseCase;
    let mockUserRepository: jest.Mocked<IUserRepository>;

    beforeEach(() => {
        mockUserRepository = {
            find: jest.fn(),
            update: jest.fn(),
        } as jest.Mocked<IUserRepository>;

        useCase = new UpdateUserUseCase(mockUserRepository);
    });

    it('should update a user when it exists', async () => {
        const userId = 'test-user-id';
        mockUserRepository.find.mockResolvedValue(user);
        mockUserRepository.update.mockResolvedValue(user);

        const result = await useCase.execute({
            id: userId,
            name: 'Jane',
        });

        expect(result.isOk()).toBe(true);

        const updatedUser = result.value();

        expect(updatedUser.getId()).toBe(userId);
        expect(updatedUser.getName()).toBe('Jane');
        expect(updatedUser.getLastName()).toBe('Doe'); // no cambia
        expect(updatedUser.getEmail()).toBe('john@doe.com');

        expect(mockUserRepository.find).toHaveBeenCalledWith(userId);
        expect(mockUserRepository.update).toHaveBeenCalledWith(
            expect.any(UserEntity)
        );
        expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should return UserNotFoundError when user does not exist', async () => {
        const userId = 'non-existent-id';
        mockUserRepository.find.mockResolvedValue(null);

        const result = await useCase.execute({ id: userId, name: 'Jane' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
