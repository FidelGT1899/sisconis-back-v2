import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
    });

    it('should throw if DATABASE_URL is not defined', () => {
        delete process.env.DATABASE_URL;

        expect(() => new PrismaService()).toThrow('DATABASE_URL is not defined');
    });

    it('should create PrismaClient when DATABASE_URL exists', () => {
        process.env.DATABASE_URL = 'postgresql://fake:fake@localhost:5432/db';

        const service = new PrismaService();
        const client = service.getClient();

        expect(client).toBeDefined();
        expect(client.$queryRaw).toBeDefined();
        expect(client.$disconnect).toBeDefined();
    });
});
