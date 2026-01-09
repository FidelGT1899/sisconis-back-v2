import { UpdateUserUseCase } from "./update-user.use-case";
import { UserNotFoundError } from "../errors/user-not-found.error";
import { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";
import { EmailVO } from "@users-domain/value-objects/email.vo";


const _user = UserEntity.rehydrate({
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
    let existingUser: UserEntity;

    beforeEach(() => {
        mockUserRepository = {
            find: jest.fn(),
            update: jest.fn(),
        } as unknown as jest.Mocked<IUserRepository>;

        useCase = new UpdateUserUseCase(mockUserRepository);

        const emailVO = EmailVO.create('john@doe.com').value();
        existingUser = UserEntity.rehydrate({
            id: 'test-user-id',
            name: 'John',
            lastName: 'Doe',
            email: emailVO,
            password: 'hashed',
            createdAt: new Date(),
        });
    });

    it('should update a user when it exists', async () => {
        const userId = 'test-user-id';
        mockUserRepository.find.mockResolvedValue(existingUser);
        mockUserRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute({
            id: userId,
            name: 'Jane',
        });

        expect(result.isOk()).toBe(true);
        const updatedUser = result.value();

        expect(updatedUser.getName()).toBe('Jane');
        expect(updatedUser.getLastName()).toBe('Doe');

        expect(mockUserRepository.update).toHaveBeenCalledWith(
            expect.any(UserEntity)
        );
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
