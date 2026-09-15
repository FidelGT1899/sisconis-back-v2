import { SystemInfoUseCase } from '@system-application/use-cases/system-info.use-case';
import { SystemInfo } from '@system-domain/system-info';

describe('SystemInfoUseCase', () => {
    it('should return system info with current environment', async () => {
        const useCase = new SystemInfoUseCase();

        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        const info = result.value();
        expect(info).toBeInstanceOf(SystemInfo);
        expect(info.name).toBe('sisconis-api');
        expect(info.environment).toBe(process.env.NODE_ENV ?? 'local');
        expect(typeof info.uptime).toBe('number');
    });

    it('should use the configured APP_VERSION when present', async () => {
        const previous = process.env.APP_VERSION;
        process.env.APP_VERSION = '2.0.0';
        try {
            const useCase = new SystemInfoUseCase();

            const result = await useCase.execute();

            expect(result.value().version).toBe('2.0.0');
        } finally {
            if (previous === undefined) {
                delete process.env.APP_VERSION;
            } else {
                process.env.APP_VERSION = previous;
            }
        }
    });
});