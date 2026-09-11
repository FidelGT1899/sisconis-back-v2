import { mock } from 'jest-mock-extended';

import { GetRoleUseCase } from '@users-application/use-cases/role/get-role.use-case';
import { RoleNotFoundError } from '@users-application/errors/role/role-not-found.error';
import type { IRoleRepository } from '@users-domain/repositories/role.repository.interface';

import { makeRoleEntity } from '@tests-factories/users/role.factory';

describe('GetRoleUseCase', () => {
    let useCase: GetRoleUseCase;
    let mockRoleRepository: ReturnType<typeof mock<IRoleRepository>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRoleRepository = mock<IRoleRepository>();
        useCase = new GetRoleUseCase(mockRoleRepository);
    });

    it('should return role when found', async () => {
        const role = makeRoleEntity({ id: 'role-123', name: 'Admin', level: 7 });
        mockRoleRepository.findById.mockResolvedValue(role);

        const result = await useCase.execute('role-123');

        expect(result.isOk()).toBe(true);
        expect(result.value()).toHaveProperty('id');
        expect(result.value()).toHaveProperty('name');
        expect(mockRoleRepository.findById).toHaveBeenCalledWith('role-123');
    });

    it('should return RoleNotFoundError when role not found', async () => {
        mockRoleRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute('non-existent');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(RoleNotFoundError);
    });

    it('should propagate repository errors', async () => {
        mockRoleRepository.findById.mockRejectedValue(new Error('DB error'));

        await expect(useCase.execute('role-123')).rejects.toThrow('DB error');
    });
});
