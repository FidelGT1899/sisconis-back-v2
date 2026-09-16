import { ReadinessController } from '@system-infrastructure/http/controllers/readiness.controller';
import type { ReadinessStatusUseCase } from '@system-application/use-cases/readiness-status.use-case';
import type { SuccessResponse } from '@shared-infrastructure/http/ports/controller';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { Result } from '@shared-kernel/errors/result';
import { ReadinessStatus } from '@system-domain/readiness-status';

const mockUseCase = (): jest.Mocked<ReadinessStatusUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<ReadinessStatusUseCase>);

describe('ReadinessController', () => {
    it('should return 200 with ready status when checks pass', async () => {
        const useCase = mockUseCase();
        const controller = new ReadinessController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(ReadinessStatus.createReady({ database: true })));

        const response = await controller.handle(makeHttpRequest());

        expect(useCase.execute).toHaveBeenCalled();
        expect(response.statusCode).toBe(200);
        const body = response.body as SuccessResponse<ReadinessStatus>;
        expect(body.status).toBe('success');
        expect(body.data).toBeDefined();
    });

    it('should return 200 with not_ready status when a check fails', async () => {
        const useCase = mockUseCase();
        const controller = new ReadinessController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(ReadinessStatus.createReady({ database: false })));

        const response = await controller.handle(makeHttpRequest());

        expect(response.statusCode).toBe(200);
        const body = response.body as SuccessResponse<ReadinessStatus>;
        expect(body.data?.status).toBe('not_ready');
    });
});