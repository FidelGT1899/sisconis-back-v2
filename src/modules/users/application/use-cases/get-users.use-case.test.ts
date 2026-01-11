import { GetUsersUseCase } from "./get-users.use-case";
import { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";
import { EmailVO } from "@users-domain/value-objects/email.vo";

describe('GetUsersUseCase', () => {
    let useCase: GetUsersUseCase;
    let mockUserRepository: jest.Mocked<IUserRepository>;

    const createMockUser = () => {
        const emailResult = EmailVO.create('test@example.com');

        const email = emailResult.isOk()
            ? emailResult.value()
            : (undefined as unknown as EmailVO);
        return UserEntity.rehydrate({
            id: 'user-123',
            name: 'John',
            lastName: 'Doe',
            email: email,
            password: 'hashed_password',
            createdAt: new Date('2023-01-01T10:00:00Z'),
            updatedAt: new Date('2023-01-01T10:00:00Z')
        });
    };

    beforeEach(() => {
        mockUserRepository = {
            index: jest.fn(),
        } as jest.Mocked<IUserRepository>;

        useCase = new GetUsersUseCase(mockUserRepository);
    });

    it('should return paginated users and map them to DTOs', async () => {
        const mockUser = createMockUser();
        const mockResponse = {
            items: [mockUser],
            total: 1
        };
        mockUserRepository.index.mockResolvedValue(mockResponse);

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.isOk()).toBe(true);
        const paginatedResult = result.value();

        expect(paginatedResult.total).toBe(1);
        expect(paginatedResult.page).toBe(1);
        expect(paginatedResult.limit).toBe(10);

        expect(paginatedResult.items[0]).toEqual({
            id: 'user-123',
            name: 'John',
            lastName: 'Doe',
            email: 'test@example.com',
            createdAt: new Date('2023-01-01T10:00:00Z')
        });
    });

    it('should use default pagination values when DTO is empty', async () => {
        mockUserRepository.index.mockResolvedValue({
            items: [],
            total: 0
        });

        await useCase.execute({});

        expect(mockUserRepository.index).toHaveBeenCalledWith({
            page: 1,
            limit: 10,
            orderBy: 'createdAt',
            direction: 'desc',
            search: ''
        });
    });
});
