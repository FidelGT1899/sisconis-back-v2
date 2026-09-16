import { mock } from 'jest-mock-extended';
import { ReadinessStatusUseCase } from '@system-application/use-cases/readiness-status.use-case';
import { ReadinessStatus } from '@system-domain/readiness-status';
import type { PrismaService } from '@shared-infrastructure/database/prisma/prisma.service';

const mockPrismaService = () => mock<PrismaService>();

describe('ReadinessStatusUseCase', () => {
    it('should return ready when database is connected', async () => {
        const prisma = mockPrismaService();
        prisma.isConnected.mockResolvedValue(true);
        const useCase = new ReadinessStatusUseCase(prisma);

        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        const status = result.value();
        expect(status).toBeInstanceOf(ReadinessStatus);
        expect(status.status).toBe('ready');
        expect(status.isReady()).toBe(true);
        expect(status.checks.database).toBe(true);
    });

    it('should return not_ready when database is disconnected', async () => {
        const prisma = mockPrismaService();
        prisma.isConnected.mockResolvedValue(false);
        const useCase = new ReadinessStatusUseCase(prisma);

        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        const status = result.value();
        expect(status.status).toBe('not_ready');
        expect(status.isReady()).toBe(false);
        expect(status.checks.database).toBe(false);
    });

    it('should always have a timestamp', async () => {
        const prisma = mockPrismaService();
        prisma.isConnected.mockResolvedValue(true);
        const useCase = new ReadinessStatusUseCase(prisma);

        const result = await useCase.execute();

        expect(result.value().timestamp).toBeInstanceOf(Date);
    });
});