import { UserEntity } from "@users-domain/entities/user.entity";
import { CreateUserUseCase } from "./create-user.use-case";
import { UserAlreadyExistsError } from "../errors/user-already-exists.error";
import { InvalidEmailError } from "@users-domain/errors/invalid-email.error";
import { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { IIdGenerator } from "@shared-domain/ports/id-generator";

const mockUserRepository = {
    existsByEmail: jest.fn(),
    save: jest.fn(),
} as jest.Mocked<IUserRepository>;

const mockIdGenerator: jest.Mocked<IIdGenerator> = {
    generate: jest.fn(),
};

const inputDto = {
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'securepassword',
};

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;

    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
        useCase = new CreateUserUseCase(mockUserRepository, mockIdGenerator);
    });

    it('should create and save a new user when email is unique', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockIdGenerator.generate.mockReturnValue('mock-uuid-12345');

        const result = await useCase.execute(inputDto);

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.save).toHaveBeenCalledWith(
            expect.any(UserEntity)
        );

        const savedUser = mockUserRepository.save.mock.calls[0][0];
        expect(savedUser.getEmail()).toBe(inputDto.email);
        expect(savedUser.getId()).toBe('mock-uuid-12345');
    });

    it('should return InvalidEmailError if email is invalid', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        const invalidInput = { ...inputDto, email: 'invalid-email' };

        const result = await useCase.execute(invalidInput);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidEmailError);
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should return UserAlreadyExistsError if email already exists', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(true);

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserAlreadyExistsError);
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error if repository save operation fails', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockIdGenerator.generate.mockReturnValue('any-id');

        const dbError = new Error('Database connection failed');
        mockUserRepository.save.mockRejectedValue(dbError);

        await expect(useCase.execute(inputDto))
            .rejects
            .toThrow('Database connection failed');
    });
});
