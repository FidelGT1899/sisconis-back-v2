import { injectable } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";

import { Clock } from "@system-domain/clock";

export type ClockResult = Result<Clock, AppError>;

@injectable()
export class ClockUseCase {
    execute(): Promise<ClockResult> {
        const clock = Clock.now();
        return Promise.resolve(Result.ok(clock));
    }
}
