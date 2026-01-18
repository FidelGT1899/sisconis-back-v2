import { ResetUserPasswordUseCase } from "./reset-user-password.use-case";
import { UserEntity } from "@users-domain/entities/user.entity";
import { UserNotFoundError } from "../errors/user-not-found.error";
import { EmailVO } from "@users-domain/value-objects/email.vo";
import { DniVO } from "@users-domain/value-objects/dni.vo";
import { PasswordVO } from "@users-domain/value-objects/password.vo";
import { IUserRepository } from "@users-domain/repositories/user.repository.interface";

const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
} as jest.Mocked<IUserRepository>;

describe('ResetUserPasswordUseCase', () => {
    let useCase: ResetUserPasswordUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new ResetUserPasswordUseCase(mockUserRepository);
    });

    it('should reset password to temporary status using DNI', async () => {
        // 1. Arrange: Creamos un usuario que ya NO tiene password temporal
        const user = UserEntity.rehydrate({
            id: 'user-123',
            name: 'John',
            lastName: 'Doe',
            email: EmailVO.create('john@test.com').value(),
            dni: DniVO.create('12345678').value(),
            password: PasswordVO.fromHashed('already-hashed-password'), // No es temporal
            createdAt: new Date()
        });

        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.update.mockImplementation((u: UserEntity) => Promise.resolve(u));

        // 2. Act
        const result = await useCase.execute('user-123');

        // 3. Assert
        expect(result.isOk()).toBe(true);
        expect(user.isPasswordTemporary()).toBe(true); // Comprobamos que volvió a ser temporal
        expect(user.getPassword()).toBe('12345678'); // Comprobamos que es el DNI
        expect(mockUserRepository.update).toHaveBeenCalledWith(user);
    });

    it('should return error if user to reset is not found', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute('invalid-id');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
