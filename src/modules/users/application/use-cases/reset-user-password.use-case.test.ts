import { ResetUserPasswordUseCase } from "./reset-user-password.use-case";
import { UserEntity } from "@users-domain/entities/user.entity";
import { UserNotFoundError } from "../errors/user-not-found.error";
import { EmailVO } from "@users-domain/value-objects/email.vo";
import { DniVO } from "@users-domain/value-objects/dni.vo";
import { PasswordVO } from "@users-domain/value-objects/password.vo";
import { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { IPasswordHasher } from "@shared-domain/ports/password-hasher";

const mockUserRepository = {
    findById: jest.fn(),
    update: jest.fn(),
} as jest.Mocked<IUserRepository>;

const mockPasswordHasher: jest.Mocked<IPasswordHasher> = {
    hash: jest.fn(),
};

describe('ResetUserPasswordUseCase', () => {
    let useCase: ResetUserPasswordUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        useCase = new ResetUserPasswordUseCase(mockUserRepository, mockPasswordHasher);
    });

    it('should reset password to temporary status using DNI', async () => {
        const user = UserEntity.rehydrate({
            id: 'user-123',
            name: 'John',
            lastName: 'Doe',
            email: EmailVO.create('john@test.com').value(),
            dni: DniVO.create('12345678').value(),
            password: PasswordVO.fromHashed('already-hashed-password'),
            createdAt: new Date()
        });

        mockPasswordHasher.hash.mockResolvedValue('hashed_12345678');
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.update.mockImplementation((u: UserEntity) => Promise.resolve(u));

        const result = await useCase.execute('user-123');

        expect(result.isOk()).toBe(true);
        expect(user.isPasswordTemporary()).toBe(true);
        expect(user.getPassword()).toBe('hashed_12345678');
        expect(mockPasswordHasher.hash).toHaveBeenCalledWith('12345678');
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
