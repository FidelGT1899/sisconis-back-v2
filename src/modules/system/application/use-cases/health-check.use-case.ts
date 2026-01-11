import { injectable } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";

import { HealthStatus } from "@system-domain/health-status";

export type HealthCheckResult = Result<HealthStatus, AppError>;

@injectable()
export class HealthCheckUseCase {
    execute(): Promise<HealthCheckResult> {
        const status = HealthStatus.createOk();

        return Promise.resolve(Result.ok(status));
    }
}
