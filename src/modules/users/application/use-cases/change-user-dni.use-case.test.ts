import { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { IIdGenerator } from "@shared-domain/ports/id-generator";
import { ChangeUserDniUseCase } from "./change-user-dni.use-case";
import { UserEntity } from "@users-domain/entities/user.entity";
import { UserNotFoundError } from "../errors/user-not-found.error";

const mockUserRepository = {
    findById: jest.fn(),
    existsByDni: jest.fn(),
    update: jest.fn(),
} as jest.Mocked<IUserRepository>;

const mockIdGenerator: jest.Mocked<IIdGenerator> = {
    generate: jest.fn(),
};

describe('ChangeUserDniUseCase', () => {
    let useCase: ChangeUserDniUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new ChangeUserDniUseCase(mockUserRepository);
    });

    it('should change user DNI', async () => {
        mockIdGenerator.generate.mockReturnValue('user-123');

        const existingUser = UserEntity.create({
            name: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
            dni: '12345678'
        }, mockIdGenerator);

        if (existingUser.isErr()) throw new Error('Setup failed');
        const userEntity = existingUser.value();

        mockUserRepository.findById.mockResolvedValue(userEntity);
        mockUserRepository.update.mockImplementation((u: UserEntity) => Promise.resolve(u));

        const dto = { id: 'user-123', newDni: '12345679' };

        const result = await useCase.execute(dto);

        expect(result.isOk()).toBe(true);
        const updatedUser = result.value();

        expect(updatedUser.getDni()).toBe('12345679');
        expect(mockUserRepository.update).toHaveBeenCalled();
    });

    it('should return UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({ id: 'non-existent', newDni: '12345679' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
    });
});
