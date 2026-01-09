import { injectable } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";

import { FeatureFlag } from "@system-domain/feature-flag";

export type FeatureFlagsResult = Result<FeatureFlag[], AppError>;

@injectable()
export class FeatureFlagsUseCase {
    execute(): Promise<FeatureFlagsResult> {
        const flags: Record<string, boolean> = {
            maintenanceMode: process.env.FEATURE_MAINTENANCE_MODE === "true",
            debugMode: process.env.FEATURE_DEBUG_MODE === "true",
            apiDocs: process.env.FEATURE_API_DOCS === "true",
        };

        const featureFlags = FeatureFlag.createAll(flags);

        return Promise.resolve(Result.ok(featureFlags));
    }
}
