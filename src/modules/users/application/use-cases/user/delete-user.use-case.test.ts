import { DeleteUserUseCase } from "./delete-user.use-case";
import { UserNotFoundError } from "../../errors/user-not-found.error";
import { UserNotDeletableError } from "@users-domain/errors/user-not-deletable.error";
import { UserStatus } from "@users-domain/entities/user.entity";

import { makeMockUserRepository } from "@users-tests/factories/mocks";
import { makeUserEntity } from "@users-tests/factories/user.factory";

describe('DeleteUserUseCase', () => {
    let useCase: DeleteUserUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        useCase = new DeleteUserUseCase(mockUserRepository);
    });

    it('should delete user successfully when inactive', async () => {
        const user = makeUserEntity({ status: UserStatus.INACTIVE });
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.delete.mockResolvedValue(undefined);

        const result = await useCase.execute('user-id-123');

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.delete).toHaveBeenCalledWith('user-id-123');
        expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should fail with UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute('non-existent-id');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail with UserNotDeletableError if user is active', async () => {
        const user = makeUserEntity({ status: UserStatus.ACTIVE });
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotDeletableError);
        expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail with UserNotDeletableError if user is suspended', async () => {
        const user = makeUserEntity({ status: UserStatus.SUSPENDED });
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotDeletableError);
        expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
});
