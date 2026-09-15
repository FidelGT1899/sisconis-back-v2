import { GetUsersUseCase } from "@users-application/use-cases/user/get-users.use-case";

import { makeMockUserRepository } from "@tests-factories/users/mocks";
import { makeUserEntity } from "@tests-factories/users/user.factory";

describe('GetUsersUseCase', () => {
    let useCase: GetUsersUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        useCase = new GetUsersUseCase(mockUserRepository);
    });

    it('should return paginated users mapped to DTOs', async () => {
        const user = makeUserEntity();
        mockUserRepository.index.mockResolvedValue({ items: [user], total: 1 });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.isOk()).toBe(true);
        const { items, total, page, limit } = result.value();

        expect(total).toBe(1);
        expect(page).toBe(1);
        expect(limit).toBe(10);
        expect(items).toHaveLength(1);

        const firstItem = items[0];
        expect(firstItem).toBeDefined();
        expect(firstItem?.id).toBe(user.getId());
        expect(firstItem?.email).toBe(user.getEmail());
    });

    it('should use default pagination values when not provided', async () => {
        mockUserRepository.index.mockResolvedValue({ items: [], total: 0 });

        await useCase.execute({});

        expect(mockUserRepository.index).toHaveBeenCalledWith({
            page: 1,
            limit: 10,
            orderBy: 'createdAt',
            direction: 'desc',
            search: ''
        });
    });

    it('should pass custom pagination and search to the repository', async () => {
        mockUserRepository.index.mockResolvedValue({ items: [], total: 0 });

        await useCase.execute({
            page: 4,
            limit: 25,
            orderBy: 'name',
            direction: 'asc',
            search: 'joh',
        });

        expect(mockUserRepository.index).toHaveBeenCalledWith({
            page: 4,
            limit: 25,
            orderBy: 'name',
            direction: 'asc',
            search: 'joh',
        });
    });

    it('should not override returned page and limit while mapping DTOs', async () => {
        const user = makeUserEntity();
        mockUserRepository.index.mockResolvedValue({ items: [user], total: 7 });

        const result = await useCase.execute({ page: 2, limit: 3 });

        expect(result.value().page).toBe(2);
        expect(result.value().limit).toBe(3);
        expect(result.value().total).toBe(7);
    });

    it('should return empty list when no users exist', async () => {
        mockUserRepository.index.mockResolvedValue({ items: [], total: 0 });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.isOk()).toBe(true);
        expect(result.value().items).toHaveLength(0);
        expect(result.value().total).toBe(0);
    });
});
