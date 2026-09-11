import { mock } from 'jest-mock-extended';

import { UpdateRoleUseCase } from '@users-application/use-cases/role/update-role.use-case';
import { RoleNotFoundError } from '@users-application/errors/role/role-not-found.error';
import type { IRoleRepository } from '@users-domain/repositories/role.repository.interface';

import { makeRoleEntity } from '@tests-factories/users/role.factory';

describe('UpdateRoleUseCase', () => {
    let useCase: UpdateRoleUseCase;
    let mockRoleRepository: ReturnType<typeof mock<IRoleRepository>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRoleRepository = mock<IRoleRepository>();
        useCase = new UpdateRoleUseCase(mockRoleRepository);
    });

    it('should update role details successfully', async () => {
        const role = makeRoleEntity({ id: 'role-123', name: 'Old Name', level: 5 });
        mockRoleRepository.findById.mockResolvedValue(role);
        mockRoleRepository.update.mockResolvedValue(role);

        const result = await useCase.execute({
            id: 'role-123',
            name: 'New Name',
            description: 'Updated description',
        });

        expect(result.isOk()).toBe(true);
        expect(result.value()).toHaveProperty('id');
        expect(mockRoleRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should return RoleNotFoundError when role not found', async () => {
        mockRoleRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute({
            id: 'non-existent',
            name: 'Name',
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(RoleNotFoundError);
        expect(mockRoleRepository.update).not.toHaveBeenCalled();
    });

    it('should keep existing name when name not provided', async () => {
        const role = makeRoleEntity({ id: 'role-123', name: 'Original', level: 5 });
        mockRoleRepository.findById.mockResolvedValue(role);
        mockRoleRepository.update.mockResolvedValue(role);

        const result = await useCase.execute({ id: 'role-123' });

        expect(result.isOk()).toBe(true);
        expect(role.getName()).toBe('Original');
    });

    it('should propagate repository errors', async () => {
        mockRoleRepository.findById.mockRejectedValue(new Error('DB error'));

        await expect(useCase.execute({ id: 'role-123', name: 'Name' })).rejects.toThrow('DB error');
    });
});
