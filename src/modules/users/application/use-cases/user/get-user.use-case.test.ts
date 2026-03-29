import { GetUserUseCase } from "./get-user.use-case";
import { UserNotFoundError } from "../../errors/user-not-found.error";

import { makeMockUserRepository } from "@users-tests/factories/mocks";
import { makeUserEntity } from "@users-tests/factories/user.factory";

describe('GetUserUseCase', () => {
    let useCase: GetUserUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        useCase = new GetUserUseCase(mockUserRepository);
    });

    it('should return a ReadUserDto when user exists', async () => {
        const user = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute('user-id-123');

        expect(result.isOk()).toBe(true);
        expect(result.value().id).toBe(user.getId());
        expect(result.value().email).toBe(user.getEmail());
        expect(mockUserRepository.findById).toHaveBeenCalledWith('user-id-123');
    });

    it('should fail with UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute('non-existent-id');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });
});
