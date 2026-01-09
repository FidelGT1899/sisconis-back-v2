import { injectable } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";

import { SystemInfo } from "@system-domain/system-info";

export type SystemInfoResult = Result<SystemInfo, AppError>;

@injectable()
export class SystemInfoUseCase {
    execute(): Promise<SystemInfoResult> {
        const info = SystemInfo.createFromEnv();
        return Promise.resolve(Result.ok(info));
    }
}
