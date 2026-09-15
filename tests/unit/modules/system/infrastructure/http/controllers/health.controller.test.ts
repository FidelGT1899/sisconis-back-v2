import { HealthController } from '@system-infrastructure/http/controllers/health.controller';
import type { HealthCheckUseCase } from '@system-application/use-cases/health-check.use-case';
import type { SuccessResponse } from '@shared-infrastructure/http/ports/controller';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { Result } from '@shared-kernel/errors/result';
import { HealthStatus } from '@system-domain/health-status';

const mockUseCase = (): jest.Mocked<HealthCheckUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<HealthCheckUseCase>);

describe('HealthController', () => {
    it('should return 200 with healthy status', async () => {
        const useCase = mockUseCase();
        const controller = new HealthController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(HealthStatus.createOk()));

        const response = await controller.handle(makeHttpRequest());

        expect(useCase.execute).toHaveBeenCalled();
        expect(response.statusCode).toBe(200);
        const body = response.body as SuccessResponse<HealthStatus>;
        expect(body.status).toBe('success');
        expect(body.data).toBeDefined();
    });
});