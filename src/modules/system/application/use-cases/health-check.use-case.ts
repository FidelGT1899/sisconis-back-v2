import { injectable } from "inversify";

import { Result } from "@shared-kernel/errors/result";

import { HealthStatus } from "@system-domain/health-status";
import type { AppError } from "@shared-kernel/errors/app.error";

export type HealthCheckResult = Result<HealthStatus, AppError>;

@injectable()
export class HealthCheckUseCase {
    execute(): Promise<HealthCheckResult> {
        const status = HealthStatus.createOk();

        return Promise.resolve(Result.ok(status));
    }
}
