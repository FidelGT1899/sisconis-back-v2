import { ActivateUserUseCase } from "@users-application/use-cases/user/activate-user.use-case";
import { UserStatus } from "@users-domain/entities/user.entity";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

import { makeMockUserRepository } from "@tests-factories/users/mocks";
import { makeUserEntity } from "@tests-factories/users/user.factory";
import { UserAlreadyActiveError } from "@users-domain/errors/user-already-active.error";

describe('ActivateUserUseCase', () => {
    let useCase: ActivateUserUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        useCase = new ActivateUserUseCase(mockUserRepository);
    });

    it('should activate an inactive user successfully', async () => {
        const user = makeUserEntity({status: UserStatus.INACTIVE});
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.update.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id-123');
        expect(result.isOk()).toBe(true);
        expect(user.isActive()).toBe(true);
        expect(mockUserRepository.update).toHaveBeenCalledWith(user);
    });

    it('should fail with UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute('user-id-123');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UserAlreadyActiveError if user is already active', async () => {
        const user = makeUserEntity({status: UserStatus.ACTIVE});
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserAlreadyActiveError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
