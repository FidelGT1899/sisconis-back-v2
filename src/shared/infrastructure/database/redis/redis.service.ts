import { injectable, inject } from "inversify";
import Redis from "ioredis";
import { env } from "@shared-infrastructure/config/env";
import { TYPES } from "@shared-infrastructure/ioc/types";
import type { ILogger } from "@shared-domain/ports/logger";
import type { Disposable } from "@shared-infrastructure/lifecycle/graceful-shutdown";

@injectable()
export class RedisService implements Disposable {
    private readonly client: Redis;

    constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
        const connectionString = env.REDIS_URL;

        if (!connectionString) {
            throw new Error("REDIS_URL is not defined");
        }

        this.client = new Redis(connectionString, {
            maxRetriesPerRequest: 3,
            lazyConnect: false,
        });

        this.client.on("error", (err) => {
            this.logger.error("Redis connection error", { message: err.message });
        });

        this.client.on("connect", () => {
            this.logger.info("Redis connected");
        });

        this.client.on("reconnecting", () => {
            this.logger.warn("Redis reconnecting");
        });
    }

    getClient(): Redis {
        return this.client;
    }

    async isConnected(): Promise<boolean> {
        try {
            const result = await this.client.ping();
            return result === "PONG";
        } catch {
            return false;
        }
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }
}