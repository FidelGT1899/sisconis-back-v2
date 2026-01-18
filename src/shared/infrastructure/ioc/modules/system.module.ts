import { ContainerModule } from "inversify";

import { HealthCheckUseCase } from "@system-application/use-cases/health-check.use-case";
import { ClockUseCase } from "@system-application/use-cases/clock.use-case";
import { FeatureFlagsUseCase } from "@system-application/use-cases/feature-flags.use-case";
import { ReadinessStatusUseCase } from "@system-application/use-cases/readiness-status.use-case";
import { SystemInfoUseCase } from "@system-application/use-cases/system-info.use-case";

import { HealthController } from "@system-infrastructure/http/controllers/health.controller";
import { ClockController } from "@system-infrastructure/http/controllers/clock.controller";
import { FeatureFlagsController } from "@system-infrastructure/http/controllers/feature-flags.controller";
import { ReadinessController } from "@system-infrastructure/http/controllers/readiness.controller";
import { SystemInfoController } from "@system-infrastructure/http/controllers/system-info.controller";

import { TYPES } from "../types";

export interface SystemHttpControllers {
    clockController: ClockController;
    featureFlagsController: FeatureFlagsController;
    healthController: HealthController;
    readinessController: ReadinessController;
    systemInfoController: SystemInfoController;
}

export const systemModule = new ContainerModule((options) => {
    const { bind } = options;

    // Use cases
    bind(TYPES.ClockUseCase).to(ClockUseCase).inTransientScope();
    bind(TYPES.FeatureFlagsUseCase).to(FeatureFlagsUseCase).inTransientScope();
    bind(TYPES.HealthCheckUseCase).to(HealthCheckUseCase).inTransientScope();
    bind(TYPES.ReadinessStatusUseCase).to(ReadinessStatusUseCase).inTransientScope();
    bind(TYPES.SystemInfoUseCase).to(SystemInfoUseCase).inTransientScope();


    // Controllers
    bind(TYPES.ClockController).to(ClockController).inTransientScope();
    bind(TYPES.FeatureFlagsController).to(FeatureFlagsController).inTransientScope();
    bind(TYPES.HealthController).to(HealthController).inTransientScope();
    bind(TYPES.ReadinessController).to(ReadinessController).inTransientScope();
    bind(TYPES.SystemInfoController).to(SystemInfoController).inTransientScope();

    // Aggregate
    bind<SystemHttpControllers>(TYPES.SystemControllers)
        .toDynamicValue((ctx) => ({
            clockController: ctx.get(TYPES.ClockController),
            featureFlagsController: ctx.get(TYPES.FeatureFlagsController),
            healthController: ctx.get(TYPES.HealthController),
            readinessController: ctx.get(TYPES.ReadinessController),
            systemInfoController: ctx.get(TYPES.SystemInfoController),
        }))
        .inTransientScope();
});
