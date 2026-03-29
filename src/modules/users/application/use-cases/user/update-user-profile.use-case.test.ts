import { UpdateUserProfileUseCase } from "./update-user-profile.use-case";
import { UserNotFoundError } from "../../errors/user-not-found.error";

import { makeMockUserRepository } from "@users-tests/factories/mocks";
import { makeUserEntity } from "@users-tests/factories/user.factory";

describe('UpdateUserProfileUseCase', () => {
    let useCase: UpdateUserProfileUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        useCase = new UpdateUserProfileUseCase(mockUserRepository);
    });

    it('should update name and lastName successfully', async () => {
        const user = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.update.mockResolvedValue(user);

        const result = await useCase.execute({
            id: 'user-id-123',
            name: 'Jane',
            lastName: 'Smith'
        });

        expect(result.isOk()).toBe(true);
        expect(result.value().name).toBe('Jane');
        expect(result.value().lastName).toBe('Smith');
        expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should update optional fields phone, address, photoUrl', async () => {
        const user = makeUserEntity();
        mockUserRepository.findById.mockResolvedValue(user);
        mockUserRepository.update.mockResolvedValue(user);

        const result = await useCase.execute({
            id: 'user-id-123',
            phone: '999888777',
            address: 'Av. Lima 123',
            photoUrl: 'https://res.cloudinary.com/test/image.jpg'
        });

        expect(result.isOk()).toBe(true);
        expect(result.value().phone).toBe('999888777');
        expect(result.value().address).toBe('Av. Lima 123');
        expect(result.value().photoUrl).toBe('https://res.cloudinary.com/test/image.jpg');
        expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should fail with UserNotFoundError if user does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({ id: 'non-existent', name: 'Jane' });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
