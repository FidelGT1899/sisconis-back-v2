import type { Server } from "node:http";

import type { ILogger } from "@shared-domain/ports/logger";

export interface Disposable {
    disconnect(): Promise<void>;
}

interface GracefulShutdownOptions {
    server: Server;
    resources: Disposable[];
    logger: ILogger;
    timeoutMs?: number;
}

export function createGracefulShutdown(options: GracefulShutdownOptions): (signal: string) => Promise<void> {
    const { server, resources, logger, timeoutMs = 10_000 } = options;

    let isShuttingDown = false;

    return async function shutdown(signal: string): Promise<void> {
        if (isShuttingDown) {
            logger.warn(`Received ${signal} but shutdown is already in progress`);
            return;
        }

        isShuttingDown = true;
        logger.info(`Received ${signal}, starting graceful shutdown`);

        const forceExitTimer = setTimeout(() => {
            logger.error(`Graceful shutdown timed out after ${timeoutMs}ms, forcing exit`);
            process.exit(1);
        }, timeoutMs);

        try {
            // 1. Stop accepting new connections; wait for in-flight requests to finish
            await new Promise<void>((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
            logger.info("HTTP server closed, no longer accepting connections");

            // 2. Disconnect resources (DB, cache, queues, etc.) only after server is closed
            await Promise.all(
                resources.map((resource) => resource.disconnect())
            );
            logger.info("All resources disconnected cleanly");

            clearTimeout(forceExitTimer);
            process.exit(0);
        } catch (error) {
            clearTimeout(forceExitTimer);
            logger.error("Error during graceful shutdown", error);
            process.exit(1);
        }
    };
}