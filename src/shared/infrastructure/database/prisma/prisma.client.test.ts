describe('Prisma bootstrap', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        process.env = { ...ORIGINAL_ENV };
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    it('should throw if DATABASE_URL is not defined', async () => {
        delete process.env.DATABASE_URL;

        await expect(
            jest.isolateModulesAsync(async () => {
                await import('./prisma.client');
            })
        ).rejects.toThrow('DATABASE_URL is not defined');
    });

    it('should create PrismaClient when DATABASE_URL exists', async () => {
        process.env.DATABASE_URL = 'postgresql://fake:fake@localhost:5432/db';

        const { prisma } = await import('./prisma.client');

        expect(prisma).toBeDefined();
        expect(typeof prisma.$connect).toBe('function');
        expect(typeof prisma.$disconnect).toBe('function');
    });
});
