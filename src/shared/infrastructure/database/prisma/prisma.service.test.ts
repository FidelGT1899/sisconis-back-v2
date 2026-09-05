import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
    it('should instantiate PrismaClient with adapter and configuration', () => {
        const service = new PrismaService();
        const client = service.getClient();

        expect(client).toBeDefined();
        expect(client.$queryRaw).toBeDefined();
        expect(client.$disconnect).toBeDefined();
    });

    it('should disconnect PrismaClient when disconnect is called', async () => {
        const service = new PrismaService();
        const client = service.getClient();
        const disconnectSpy = jest.spyOn(client, '$disconnect').mockResolvedValue(undefined as never);

        await service.disconnect();

        expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('should return true if query succeeds on isConnected', async () => {
        const service = new PrismaService();
        const client = service.getClient();
        jest.spyOn(client, '$queryRaw').mockResolvedValue([{ 1: 1 }] as never);

        const connected = await service.isConnected();

        expect(connected).toBe(true);
    });

    it('should return false if query fails on isConnected', async () => {
        const service = new PrismaService();
        const client = service.getClient();
        jest.spyOn(client, '$queryRaw').mockRejectedValue(new Error('Connection lost') as never);

        const connected = await service.isConnected();

        expect(connected).toBe(false);
    });
});

