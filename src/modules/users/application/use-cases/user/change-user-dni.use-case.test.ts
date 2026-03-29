import { ChangeUserDniUseCase } from "./change-user-dni.use-case";
import { UserNotFoundError } from "../../errors/user-not-found.error";
import { DniAlreadyInUseError } from "../../errors/dni-already-in-use.error";
import { InvalidDniError } from "@users-domain/errors/invalid-dni.error";

import { makeMockUserRepository } from "@users-tests/factories/mocks";
import { makeUserEntity } from "@users-tests/factories/user.factory";

describe('ChangeUserDniUseCase', () => {
    let useCase: ChangeUserDniUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        useCase = new ChangeUserDniUseCase(mockUserRepository);
    });

    it('should change DNI successfully', async () => {
        const user = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.existsByDniExcluding.mockResolvedValue(false);
        mockUserRepository.update.mockResolvedValue(user);

        const result = await useCase.execute({ id: 'user-id-123', newDni: '87654321' });

        expect(result.isOk()).toBe(true);
        expect(result.value().dni).toBe('87654321');
        expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should return same user if DNI is unchanged', async () => {
        const user = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute({ id: 'user-id-123', newDni: '12345678' });

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({ id: 'non-existent', newDni: '87654321' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with DniAlreadyInUseError if DNI is taken', async () => {
        const user = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.existsByDniExcluding.mockResolvedValue(true);

        const result = await useCase.execute({ id: 'user-id-123', newDni: '87654321' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(DniAlreadyInUseError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with InvalidDniError if new DNI format is invalid', async () => {
        const user = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.existsByDniExcluding.mockResolvedValue(false);

        const result = await useCase.execute({ id: 'user-id-123', newDni: 'invalid' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidDniError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
