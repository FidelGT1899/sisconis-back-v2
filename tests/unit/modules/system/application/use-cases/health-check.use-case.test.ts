import { HealthCheckUseCase } from '@system-application/use-cases/health-check.use-case';
import { HealthStatus } from '@system-domain/health-status';

describe('HealthCheckUseCase', () => {
    it('should return an ok health status', async () => {
        const useCase = new HealthCheckUseCase();

        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        const status = result.value();
        expect(status).toBeInstanceOf(HealthStatus);
        expect(status.status).toBe('ok');
        expect(status.isHealthy()).toBe(true);
    });
});