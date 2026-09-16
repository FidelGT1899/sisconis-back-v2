import { ReadinessStatus } from '@system-domain/readiness-status';

describe('ReadinessStatus', () => {
    it('should be ready when every check passes', () => {
        const status = ReadinessStatus.createReady({ database: true });

        expect(status.status).toBe('ready');
        expect(status.isReady()).toBe(true);
        expect(status.checks).toEqual({ database: true });
    });

    it('should be ready when no checks are registered', () => {
        const status = ReadinessStatus.createReady();

        expect(status.status).toBe('ready');
        expect(status.isReady()).toBe(true);
    });

    it('should be not_ready when at least one check fails', () => {
        const status = ReadinessStatus.createReady({ database: true, cache: false });

        expect(status.status).toBe('not_ready');
        expect(status.isReady()).toBe(false);
    });

    it('should be not_ready when all checks fail', () => {
        const status = ReadinessStatus.createReady({ database: false });

        expect(status.status).toBe('not_ready');
        expect(status.isReady()).toBe(false);
    });

    it('should create a not_ready status with createNotReady', () => {
        const status = ReadinessStatus.createNotReady({ database: false });

        expect(status.status).toBe('not_ready');
        expect(status.isReady()).toBe(false);
    });
});