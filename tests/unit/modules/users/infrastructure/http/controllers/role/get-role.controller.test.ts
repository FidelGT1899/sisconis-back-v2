import { GetRoleController } from '@users-infrastructure/http/controllers/role/get-role.controller';
import type { GetRoleUseCase } from '@users-application/use-cases/role/get-role.use-case';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { Result } from '@shared-kernel/errors/result';
import { RoleNotFoundError } from '@users-application/errors/role/role-not-found.error';
import type { SuccessResponse } from '@shared-infrastructure/http/ports/controller';

const mockUseCase = (): jest.Mocked<GetRoleUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<GetRoleUseCase>);

describe('GetRoleController', () => {
    it('should return 200 with role data mapped to HTTP response', async () => {
        const useCase = mockUseCase();
        const controller = new GetRoleController(useCase);
        useCase.execute.mockResolvedValue(Result.ok({
            id: 'role-123',
            name: 'Admin',
            level: 7,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
        }));

        const response = await controller.handle(
            makeHttpRequest({ params: { id: 'role-123' } })
        );

        const body = response.body as SuccessResponse;
        expect(useCase.execute).toHaveBeenCalledWith('role-123');
        expect(response.statusCode).toBe(200);
        expect(body.status).toBe('success');
        expect(body.data).toEqual({
            id: 'role-123',
            name: 'Admin',
            level: 7,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        });
    });

    it('should map updatedAt with its own value when present', async () => {
        const useCase = mockUseCase();
        const controller = new GetRoleController(useCase);
        useCase.execute.mockResolvedValue(Result.ok({
            id: 'role-123',
            name: 'Admin',
            level: 7,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-05-05T00:00:00.000Z'),
        }));

        const response = await controller.handle(
            makeHttpRequest({ params: { id: 'role-123' } })
        );

        const body = response.body as SuccessResponse;
        expect(body.data).toEqual({
            id: 'role-123',
            name: 'Admin',
            level: 7,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-05-05T00:00:00.000Z',
        });
    });

    it('should return 400 when id param is missing', async () => {
        const useCase = mockUseCase();
        const controller = new GetRoleController(useCase);

        const response = await controller.handle(makeHttpRequest({}));

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe('error');
    });

    it('should return error when role not found', async () => {
        const useCase = mockUseCase();
        const controller = new GetRoleController(useCase);
        const error = new RoleNotFoundError('role-123');
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({ params: { id: 'role-123' } })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe('error');
        expect(response.body?.code).toBe(error.code);
    });

    it('should propagate use case errors', async () => {
        const useCase = mockUseCase();
        const controller = new GetRoleController(useCase);
        useCase.execute.mockRejectedValue(new Error('DB error'));

        await expect(
            controller.handle(makeHttpRequest({ params: { id: 'role-123' } }))
        ).rejects.toThrow('DB error');
    });
});
