import { GetRolesController } from '@users-infrastructure/http/controllers/role/get-roles.controller';
import type { GetRolesUseCase } from '@users-application/use-cases/role/get-roles.use-case';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { Result } from '@shared-kernel/errors/result';
import { UnexpectedError } from '@shared-kernel/errors/unexpected.error';
import type { SuccessResponse } from '@shared-infrastructure/http/ports/controller';
import { ZodError } from 'zod';

const mockUseCase = (): jest.Mocked<GetRolesUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<GetRolesUseCase>);

describe('GetRolesController', () => {
    it('should return 200 with paginated roles mapped to HTTP response', async () => {
        const useCase = mockUseCase();
        const controller = new GetRolesController(useCase);
        const createdAtIso = '2024-01-01T00:00:00.000Z';
        useCase.execute.mockResolvedValue(Result.ok({
            items: [
                { id: 'r1', name: 'Admin', level: 7, createdAt: new Date(createdAtIso) },
            ],
            total: 1,
            page: 1,
            limit: 10,
        }));

        const response = await controller.handle(
            makeHttpRequest({ query: {} })
        );

        const body = response.body as SuccessResponse;
        expect(response.statusCode).toBe(200);
        expect(body.status).toBe('success');
        expect(body.data).toEqual([
            {
                id: 'r1',
                name: 'Admin',
                level: 7,
                createdAt: createdAtIso,
                updatedAt: createdAtIso,
            },
        ]);
        expect(body.meta).toEqual(
            expect.objectContaining({ page: 1, limit: 10, total: 1, totalPages: 1 })
        );
    });

    it('should parse query params and pass to use case', async () => {
        const useCase = mockUseCase();
        const controller = new GetRolesController(useCase);
        useCase.execute.mockResolvedValue(Result.ok({
            items: [],
            total: 0,
            page: 2,
            limit: 5,
        }));

        await controller.handle(
            makeHttpRequest({ query: { page: '2', limit: '5', orderBy: 'name', direction: 'asc' } })
        );

        expect(useCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({ page: 2, limit: 5, orderBy: 'name', direction: 'asc' })
        );
    });

    it('should return empty list when no roles exist', async () => {
        const useCase = mockUseCase();
        const controller = new GetRolesController(useCase);
        useCase.execute.mockResolvedValue(Result.ok({
            items: [],
            total: 0,
            page: 1,
            limit: 10,
        }));

        const response = await controller.handle(
            makeHttpRequest({ query: {} })
        );

        const body = response.body as SuccessResponse;
        expect(response.statusCode).toBe(200);
        expect(body.data).toEqual([]);
    });

    it('should propagate use case errors', async () => {
        const useCase = mockUseCase();
        const controller = new GetRolesController(useCase);
        useCase.execute.mockRejectedValue(new Error('DB error'));

        await expect(
            controller.handle(makeHttpRequest({ query: {} }))
        ).rejects.toThrow('DB error');
    });

    it('should return error response when use case returns Result.fail', async () => {
        const useCase = mockUseCase();
        const controller = new GetRolesController(useCase);
        const error = new UnexpectedError('LIST_ROLES_FAILED', 'Failed to list roles');
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(makeHttpRequest({ query: {} }));

        expect(response.statusCode).toBe(500);
        expect(response.body?.status).toBe('error');
        expect(response.body?.code).toBe('LIST_ROLES_FAILED');
    });

    it('should throw ZodError before executing when query is invalid', async () => {
        const useCase = mockUseCase();
        const controller = new GetRolesController(useCase);

        await expect(
            controller.handle(
                makeHttpRequest({ query: { page: 'not-a-number' } })
            )
        ).rejects.toThrow(ZodError);

        expect(useCase.execute).not.toHaveBeenCalled();
    });
});
