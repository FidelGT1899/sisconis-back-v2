import { ChangeUserPasswordUseCase } from "./change-user-password.use-case";
import { UserNotFoundError } from "../../errors/user-not-found.error";
import { InvalidPasswordError } from "@users-domain/errors/invalid-password.error";

import { makeMockUserRepository, makeMockPasswordHasher } from "@users-tests/factories/mocks";
import { makeUserEntity } from "@users-tests/factories/user.factory";

describe('ChangeUserPasswordUseCase', () => {
    let useCase: ChangeUserPasswordUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;
    let mockPasswordHasher: ReturnType<typeof makeMockPasswordHasher>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        mockPasswordHasher = makeMockPasswordHasher();
        useCase = new ChangeUserPasswordUseCase(mockUserRepository, mockPasswordHasher);
    });

    it('should change password successfully', async () => {
        const user = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.update.mockResolvedValue(user);
        mockPasswordHasher.hash.mockResolvedValue('new_hashed_password');

        const result = await useCase.execute({ id: 'user-id-123', newPassword: 'NewPassword123' });

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should fail with UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({ id: 'non-existent', newPassword: 'NewPassword123' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with InvalidPasswordError if password is too weak', async () => {
        const user = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute({ id: 'user-id-123', newPassword: 'weak' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidPasswordError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
