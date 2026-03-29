import { CreateUserUseCase } from "./create-user.use-case";
import { UserAlreadyExistsError } from "../../errors/user-already-exists.error";
import { RoleNotFoundError } from "../../errors/role/role-not-found.error";
import { InvalidEmailError } from "@users-domain/errors/invalid-email.error";
import { InvalidDniError } from "@users-domain/errors/invalid-dni.error";

import {
    makeMockUserRepository,
    makeMockRoleRepository,
    makeMockIdGenerator,
    makeMockPasswordHasher
} from "@users-tests/factories/mocks";
import { makeRoleEntity } from "@users-tests/factories/role.factory";
import { makeUserEntity } from "@users-tests/factories/user.factory";

const inputDto = {
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    dni: '12345678',
    roleId: 'role-id-123',
};

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;
    let mockRoleRepository: ReturnType<typeof makeMockRoleRepository>;
    let mockIdGenerator: ReturnType<typeof makeMockIdGenerator>;
    let mockPasswordHasher: ReturnType<typeof makeMockPasswordHasher>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        mockRoleRepository = makeMockRoleRepository();
        mockIdGenerator = makeMockIdGenerator();
        mockPasswordHasher = makeMockPasswordHasher();
        useCase = new CreateUserUseCase(
            mockUserRepository,
            mockRoleRepository,
            mockIdGenerator,
            mockPasswordHasher
        );
    });

    it('should create and save a new user successfully', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.existsByDni.mockResolvedValue(false);
        mockRoleRepository.findById.mockResolvedValue(makeRoleEntity());
        mockUserRepository.save.mockResolvedValue(makeUserEntity());

        const result = await useCase.execute(inputDto);

        expect(result.isOk()).toBe(true);
        expect(result.value().email).toBe(inputDto.email);
        expect(result.value().dni).toBe(inputDto.dni);
        expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should fail with UserAlreadyExistsError if email is taken', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(true);

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserAlreadyExistsError);
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should fail with UserAlreadyExistsError if DNI is taken', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.existsByDni.mockResolvedValue(true);

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserAlreadyExistsError);
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should fail with RoleNotFoundError if role does not exist', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.existsByDni.mockResolvedValue(false);
        mockRoleRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(RoleNotFoundError);
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should fail with InvalidEmailError if email format is invalid', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.existsByDni.mockResolvedValue(false);
        mockRoleRepository.findById.mockResolvedValue(makeRoleEntity());

        const result = await useCase.execute({ ...inputDto, email: 'invalid-email' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidEmailError);
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should fail with InvalidDniError if DNI format is invalid', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.existsByDni.mockResolvedValue(false);
        mockRoleRepository.findById.mockResolvedValue(makeRoleEntity());

        const result = await useCase.execute({ ...inputDto, dni: 'invalid' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidDniError);
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should bubble up repository errors', async () => {
        mockUserRepository.existsByEmail.mockResolvedValue(false);
        mockUserRepository.existsByDni.mockResolvedValue(false);
        mockRoleRepository.findById.mockResolvedValue(makeRoleEntity());
        mockUserRepository.save.mockRejectedValue(new Error('DB_FATAL_ERROR'));

        await expect(useCase.execute(inputDto)).rejects.toThrow('DB_FATAL_ERROR');
    });
});
