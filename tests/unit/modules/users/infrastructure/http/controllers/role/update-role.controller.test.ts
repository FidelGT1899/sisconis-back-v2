import { UpdateRoleController } from '@users-infrastructure/http/controllers/role/update-role.controller';
import type { UpdateRoleUseCase } from '@users-application/use-cases/role/update-role.use-case';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { Result } from '@shared-kernel/errors/result';
import { RoleNotFoundError } from '@users-application/errors/role/role-not-found.error';
import type { SuccessResponse } from '@shared-infrastructure/http/ports/controller';

const mockUseCase = (): jest.Mocked<UpdateRoleUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<UpdateRoleUseCase>);

const VALID_UUID = '12345678-1234-4234-a234-123456789012';

describe('UpdateRoleController', () => {
    it('should return 200 with updated role mapped to HTTP response', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateRoleController(useCase);
        useCase.execute.mockResolvedValue(Result.ok({
            id: VALID_UUID,
            name: 'Updated Role',
            level: 5,
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
            updatedAt: new Date('2024-02-02T00:00:00.000Z'),
        }));

        const response = await controller.handle(
            makeHttpRequest({
                params: { id: VALID_UUID },
                body: { name: 'Updated Role' },
            })
        );

        const body = response.body as SuccessResponse;
        expect(useCase.execute).toHaveBeenCalledWith({
            id: VALID_UUID,
            name: 'Updated Role',
        });
        expect(response.statusCode).toBe(200);
        expect(body.status).toBe('success');
        expect(body.data).toEqual({
            id: VALID_UUID,
            name: 'Updated Role',
            level: 5,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-02-02T00:00:00.000Z',
        });
    });

    it('should return 400 when id param is missing', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateRoleController(useCase);

        const response = await controller.handle(
            makeHttpRequest({ body: { name: 'Test' } })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe('error');
    });

    it('should throw when body is empty', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateRoleController(useCase);

        await expect(
            controller.handle(
                makeHttpRequest({
                    params: { id: VALID_UUID },
                    body: {},
                })
            )
        ).rejects.toThrow();
    });

    it('should return error when role not found', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateRoleController(useCase);
        const error = new RoleNotFoundError(VALID_UUID);
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({
                params: { id: VALID_UUID },
                body: { name: 'New Name' },
            })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe('error');
        expect(response.body?.code).toBe(error.code);
    });
});
