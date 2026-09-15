import { Container } from 'inversify';
import type { Router } from 'express';

import { systemModule } from '@shared-infrastructure/ioc/modules/system.module';
import { TYPES } from '@shared-infrastructure/ioc/types';

describe('System IoC module', () => {
    it('should resolve SystemRouter with all controllers and use cases bound', () => {
        const container = new Container();

        container.bind(TYPES.PrismaService).toConstantValue({
            getClient: jest.fn(),
            isConnected: jest.fn().mockResolvedValue(true),
            disconnect: jest.fn().mockResolvedValue(undefined),
        });

        void container.load(systemModule);

        const systemRouter = container.get<Router>(TYPES.SystemRouter);

        expect(systemRouter).toBeDefined();
    });

    it('should resolve every system application an infrastructure binding', () => {
        const container = new Container();

        container.bind(TYPES.PrismaService).toConstantValue({
            getClient: jest.fn(),
            isConnected: jest.fn().mockResolvedValue(true),
            disconnect: jest.fn().mockResolvedValue(undefined),
        });

        void container.load(systemModule);

        expect(container.get(TYPES.HealthCheckUseCase)).toBeDefined();
        expect(container.get(TYPES.SystemInfoUseCase)).toBeDefined();
        expect(container.get(TYPES.ClockUseCase)).toBeDefined();
        expect(container.get(TYPES.FeatureFlagsUseCase)).toBeDefined();
        expect(container.get(TYPES.ReadinessStatusUseCase)).toBeDefined();

        expect(container.get(TYPES.HealthController)).toBeDefined();
        expect(container.get(TYPES.SystemInfoController)).toBeDefined();
        expect(container.get(TYPES.ClockController)).toBeDefined();
        expect(container.get(TYPES.ReadinessController)).toBeDefined();
        expect(container.get(TYPES.FeatureFlagsController)).toBeDefined();
    });
});