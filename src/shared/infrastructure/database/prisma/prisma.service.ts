import { injectable } from "inversify";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma-generated";

@injectable()
export class PrismaService {
    private readonly client: PrismaClient;

    constructor() {
        const connectionString = process.env.DATABASE_URL;

        if (!connectionString) {
            throw new Error("DATABASE_URL is not defined");
        }

        const adapter = new PrismaPg({ connectionString });

        this.client = new PrismaClient({
            adapter,
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    getClient(): PrismaClient {
        return this.client;
    }

    async isConnected(): Promise<boolean> {
        try {
            await this.client.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }

    async disconnect(): Promise<void> {
        await this.client.$disconnect();
    }
}
