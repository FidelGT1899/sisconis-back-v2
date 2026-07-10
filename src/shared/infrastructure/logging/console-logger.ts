import { injectable } from "inversify";
import type { ILogger } from "@shared-domain/ports/logger";

@injectable()
export class ConsoleLogger implements ILogger {
    error(message: string, meta?: unknown): void {
        console.error(`[ERROR] ${message}`, meta ?? "");
    }

    warn(message: string, meta?: unknown): void {
        console.warn(`[WARN] ${message}`, meta ?? "");
    }

    info(message: string, meta?: unknown): void {
        console.info(`[INFO] ${message}`, meta ?? "");
    }

    debug(message: string, meta?: unknown): void {
        console.debug(`[DEBUG] ${message}`, meta ?? "");
    }
}