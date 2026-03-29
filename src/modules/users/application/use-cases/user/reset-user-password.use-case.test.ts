import { ResetUserPasswordUseCase } from "./reset-user-password.use-case";
import { UserNotFoundError } from "../../errors/user-not-found.error";

import { makeMockUserRepository, makeMockPasswordHasher } from "@users-tests/factories/mocks";
import { makeUserEntity } from "@users-tests/factories/user.factory";

describe('ResetUserPasswordUseCase', () => {
    let useCase: ResetUserPasswordUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;
    let mockPasswordHasher: ReturnType<typeof makeMockPasswordHasher>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        mockPasswordHasher = makeMockPasswordHasher();
        useCase = new ResetUserPasswordUseCase(mockUserRepository, mockPasswordHasher);
    });

    it('should reset password to temporary using DNI', async () => {
        const user = makeUserEntity();
        mockPasswordHasher.hash.mockResolvedValue('hashed_12345678');
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.update.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(result.isOk()).toBe(true);
        expect(user.isPasswordTemporary()).toBe(true);
        expect(user.getPassword()).toBe('hashed_12345678');
        expect(mockUserRepository.update).toHaveBeenCalledWith(user);
    });

    it('should fail with UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute('non-existent-id');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
