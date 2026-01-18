import { inject, injectable } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";
import type { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";

import { ReadinessStatus } from "@system-domain/readiness-status";

export type ReadinessCheckResult = Result<ReadinessStatus, AppError>;

@injectable()
export class ReadinessStatusUseCase {
    constructor(
        @inject(TYPES.PrismaService)
        private readonly prisma: PrismaService,
        // @inject(TYPES.CacheService)
        // private readonly cache: CacheService
    ) { }

    async execute(): Promise<ReadinessCheckResult> {
        const checks = {
            database: await this.prisma.isConnected(),
            // cache: true,
            // externalApi: true
        };

        const status = ReadinessStatus.createReady(checks);

        return Promise.resolve(Result.ok(status));
    }
}
