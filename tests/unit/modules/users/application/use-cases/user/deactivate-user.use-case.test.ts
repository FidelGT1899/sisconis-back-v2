import { DeactivateUserUseCase } from "@users-application/use-cases/user/deactivate-user.use-case";
import { UserStatus } from "@users-domain/entities/user.entity";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

import { makeMockUserRepository } from "@tests-factories/users/mocks";
import { makeUserEntity } from "@tests-factories/users/user.factory";
import { UserAlreadyInactiveError } from "@users-domain/errors/user-already-deactive.error";

describe('DeactivateUserUseCase', () => {
    let useCase: DeactivateUserUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        useCase = new DeactivateUserUseCase(mockUserRepository);
    });

    it('should deactivate an active user successfully', async () => {
        const user = makeUserEntity({status: UserStatus.ACTIVE});
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.update.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id-123');
        expect(result.isOk()).toBe(true);
        expect(user.isInactive()).toBe(true);
        expect(mockUserRepository.update).toHaveBeenCalledWith(user);
    });

    it('should fail with UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute('user-id-123');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UserAlreadyInactiveError if user is already inactive', async () => {
        const user = makeUserEntity({status: UserStatus.INACTIVE});
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserAlreadyInactiveError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
