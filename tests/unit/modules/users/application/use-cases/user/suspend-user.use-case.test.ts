import { SuspendUserUseCase } from "@users-application/use-cases/user/suspend-user.use-case";
import { UserStatus } from "@users-domain/entities/user.entity";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

import { makeMockUserRepository } from "@tests-factories/users/mocks";
import { makeUserEntity } from "@tests-factories/users/user.factory";
import { UserAlreadySuspendedError } from "@users-domain/errors/user-already-suspended.error";

describe('SuspendUserUseCase', () => {
    let useCase: SuspendUserUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        useCase = new SuspendUserUseCase(mockUserRepository);
    });

    it('should suspend an activate user succeessfully', async () => {
        const user = makeUserEntity({status: UserStatus.ACTIVE});
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.update.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id-123');
        expect(result.isOk()).toBe(true);
        expect(user.isSuspended()).toBe(true);
        expect(mockUserRepository.update).toHaveBeenCalledWith(user);
    });

    it('should fail with UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute('user-id-123');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UserAlreadySuspendedError if user is already suspended', async () => {
        const user = makeUserEntity({status: UserStatus.SUSPENDED});
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserAlreadySuspendedError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});