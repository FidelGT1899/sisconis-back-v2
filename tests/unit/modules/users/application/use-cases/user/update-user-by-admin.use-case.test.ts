import { mock } from 'jest-mock-extended';

import { UpdateUserByAdminUseCase } from '@users-application/use-cases/user/update-user-by-admin.use-case';
import { UserNotFoundError } from '@users-application/errors/user-not-found.error';
import { EmailAlreadyInUseError } from '@users-application/errors/email-already-in-use.error';
import { DniAlreadyInUseError } from '@users-application/errors/dni-already-in-use.error';
import type { IUserRepository } from '@users-domain/repositories/user.repository.interface';

import { makeUserEntity } from '@tests-factories/users/user.factory';

const inputDto = {
    id: 'user-id-123',
    name: 'Updated',
    lastName: 'User',
    email: 'updated@example.com',
    dni: '87654321',
    phone: '555-0100',
    address: '123 Main St',
    photoUrl: 'https://example.com/photo.jpg',
};

describe('UpdateUserByAdminUseCase', () => {
    let useCase: UpdateUserByAdminUseCase;
    let mockUserRepository: ReturnType<typeof mock<IUserRepository>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = mock<IUserRepository>();
        useCase = new UpdateUserByAdminUseCase(mockUserRepository);
    });

    it('should update user profile successfully', async () => {
        const existingUser = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(existingUser);
        mockUserRepository.existsByEmailExcluding.mockResolvedValue(false);
        mockUserRepository.existsByDniExcluding.mockResolvedValue(false);
        mockUserRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute(inputDto);

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should return UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should return EmailAlreadyInUseError if email is taken by another user', async () => {
        mockUserRepository.findById.mockResolvedValue(makeUserEntity());
        mockUserRepository.existsByEmailExcluding.mockResolvedValue(true);

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(EmailAlreadyInUseError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should return DniAlreadyInUseError if DNI is taken by another user', async () => {
        mockUserRepository.findById.mockResolvedValue(makeUserEntity());
        mockUserRepository.existsByEmailExcluding.mockResolvedValue(false);
        mockUserRepository.existsByDniExcluding.mockResolvedValue(true);

        const result = await useCase.execute(inputDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(DniAlreadyInUseError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should skip email check if email not provided', async () => {
        mockUserRepository.findById.mockResolvedValue(makeUserEntity());
        const existingUser = makeUserEntity();
        mockUserRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute({ id: inputDto.id, name: 'New Name' });

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.existsByEmailExcluding).not.toHaveBeenCalled();
    });

    it('should skip DNI check if DNI not provided', async () => {
        mockUserRepository.findById.mockResolvedValue(makeUserEntity());
        const existingUser = makeUserEntity();
        mockUserRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute({ id: inputDto.id });

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.existsByDniExcluding).not.toHaveBeenCalled();
    });

    it('should not update profile fields not provided', async () => {
        const existingUser = makeUserEntity({ name: 'Original' });
        mockUserRepository.findById.mockResolvedValue(existingUser);
        mockUserRepository.update.mockResolvedValue(existingUser);

        const result = await useCase.execute({ id: inputDto.id });

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should propagate repository errors', async () => {
        mockUserRepository.findById.mockRejectedValue(new Error('DB connection lost'));

        await expect(useCase.execute(inputDto)).rejects.toThrow('DB connection lost');
    });
});
