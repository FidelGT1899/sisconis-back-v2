import { GetUsersUseCase } from "./get-users.use-case";
import { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";

describe('GetUsersUseCase', () => {
    let useCase: GetUsersUseCase;
    let mockUserRepository: jest.Mocked<IUserRepository>;

    beforeEach(() => {
        mockUserRepository = {
            index: jest.fn(),
        } as jest.Mocked<IUserRepository>;

        useCase = new GetUsersUseCase(mockUserRepository);
    });

    it('should return paginated users', async () => {
        const users: UserEntity[] = [];

        mockUserRepository.index.mockResolvedValue({
            items: users,
            total: 0
        });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.isOk()).toBe(true);

        expect(result.value()).toEqual({
            items: users,
            total: 0,
            page: 1,
            limit: 10
        });

        expect(mockUserRepository.index).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 1,
                limit: 10,
                orderBy: 'createdAt',
                direction: 'desc',
                search: '',
            })
        );
    });

    it('should use default pagination when dto is empty', async () => {
        const users: UserEntity[] = [];
        mockUserRepository.index.mockResolvedValue(users);

        const result = await useCase.execute({});

        expect(result.isOk()).toBe(true);

        expect(mockUserRepository.index).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 1,
                limit: 10,
                orderBy: 'createdAt',
                direction: 'desc',
                search: '',
            })
        );
    });
});
