// import { injectable } from "inversify";
// import pino from "pino";
// import type { ILogger } from "@shared-domain/ports/logger";

// @injectable()
// export class PinoLogger implements ILogger {
//     private readonly logger = pino({
//         level: process.env.NODE_ENV === "production" ? "info" : "debug",
//         transport: process.env.NODE_ENV !== "production"
//             ? { target: "pino-pretty" } // legible en dev, JSON crudo en prod
//             : undefined,
//     });

//     error(message: string, meta?: unknown): void {
//         this.logger.error(meta, message);
//     }
//     warn(message: string, meta?: unknown): void {
//         this.logger.warn(meta, message);
//     }
//     info(message: string, meta?: unknown): void {
//         this.logger.info(meta, message);
//     }
//     debug(message: string, meta?: unknown): void {
//         this.logger.debug(meta, message);
//     }
// }