import { mock } from 'jest-mock-extended';

import { GetRolesUseCase } from '@users-application/use-cases/role/get-roles.use-case';
import type { IRoleRepository } from '@users-domain/repositories/role.repository.interface';

import { makeRoleEntity } from '@tests-factories/users/role.factory';

describe('GetRolesUseCase', () => {
    let useCase: GetRolesUseCase;
    let mockRoleRepository: ReturnType<typeof mock<IRoleRepository>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRoleRepository = mock<IRoleRepository>();
        useCase = new GetRolesUseCase(mockRoleRepository);
    });

    it('should return paginated roles with defaults', async () => {
        const roles = [
            makeRoleEntity({ id: 'r1', name: 'Admin', level: 7 }),
            makeRoleEntity({ id: 'r2', name: 'User', level: 3 }),
        ];
        mockRoleRepository.index.mockResolvedValue({ items: roles, total: 2 });

        const result = await useCase.execute({});

        expect(result.isOk()).toBe(true);
        expect(result.value().items).toHaveLength(2);
        expect(result.value().total).toBe(2);
        expect(result.value().page).toBe(1);
        expect(result.value().limit).toBe(10);
    });

    it('should apply custom pagination params', async () => {
        mockRoleRepository.index.mockResolvedValue({ items: [], total: 0 });

        await useCase.execute({ page: 3, limit: 5, orderBy: 'name', direction: 'asc', search: 'admin' });

        expect(mockRoleRepository.index).toHaveBeenCalledWith({
            page: 3,
            limit: 5,
            orderBy: 'name',
            direction: 'asc',
            search: 'admin',
        });
    });

    it('should return empty list when no roles exist', async () => {
        mockRoleRepository.index.mockResolvedValue({ items: [], total: 0 });

        const result = await useCase.execute({});

        expect(result.isOk()).toBe(true);
        expect(result.value().items).toHaveLength(0);
        expect(result.value().total).toBe(0);
    });

    it('should map role properties correctly', async () => {
        const role = makeRoleEntity({ id: 'r1', name: 'Editor', level: 5 });
        mockRoleRepository.index.mockResolvedValue({ items: [role], total: 1 });

        const result = await useCase.execute({});

        const item = result.value().items[0]!;
        expect(item.id).toBe('r1');
        expect(item.name).toBe('Editor');
        expect(item.level).toBe(5);
    });

    it('should propagate repository errors', async () => {
        mockRoleRepository.index.mockRejectedValue(new Error('DB failure'));

        await expect(useCase.execute({})).rejects.toThrow('DB failure');
    });
});
