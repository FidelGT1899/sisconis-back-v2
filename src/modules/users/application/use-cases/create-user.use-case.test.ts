import { UserEntity } from "../../domain/entities/user.entity";
import { CreateUserUseCase } from "./create-user.use-case";
import { UserAlreadyExistsError } from "../errors/user-already-exists.error";
import { InvalidEmailError } from "../../domain/errors/invalid-email.error";
import { UnexpectedError } from "@shared-kernel/errors/unexpected.error";
import { IUserRepository } from "../../domain/repositories/user.repository.interface";
import { IIdGenerator } from "@shared-domain/ports/id-generator";

const mockUserRepository: jest.Mocked<IUserRepository> = {
    existsByEmail: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const mockIdGenerator: jest.Mocked<IIdGenerator> = {
    generate: jest.fn(),
};

const inputDto = {
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'securepassword',
};

const validUser = {
    getId: () => 'mock-uuid-12345',
    getEmail: () => inputDto.email,
} as unknown as UserEntity;

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(UserEntity, 'create').mockReturnValue(validUser);
        useCase = new CreateUserUseCase(mockUserRepository, mockIdGenerator);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should create and save a new user when email is unique', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);

        const result = await useCase.execute(inputDto);

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(inputDto.email);
        expect(UserEntity.create).toHaveBeenCalledWith(
            expect.objectContaining({ email: inputDto.email }), 
            mockIdGenerator
        );
        expect(mockUserRepository.save).toHaveBeenCalledWith(validUser);
    });

    it('should return UserAlreadyExistsError if email already exists', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(true);

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserAlreadyExistsError);
        expect(mockUserRepository.save).not.toHaveBeenCalled();
        expect(UserEntity.create).not.toHaveBeenCalled();
    });

    it('should return AppError if UserEntity.create throws a DomainError (e.g., InvalidEmailError)', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        
        jest.spyOn(UserEntity, 'create').mockImplementation(() => {
            throw new InvalidEmailError('email-invalido');
        });

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidEmailError);
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should return UnexpectedError if repository save operation fails', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        const dbError = new Error('Database connection failed');
        mockUserRepository.save.mockRejectedValue(dbError);

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UnexpectedError);
        expect(result.error()?.message).toContain('Database connection failed');
    });
});