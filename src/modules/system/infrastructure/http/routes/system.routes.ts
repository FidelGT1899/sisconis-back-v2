import { Router } from "express";

import { expressAdapter } from "@shared-infrastructure/http/adapters/express.adapter";

import { HealthController } from "@system-infrastructure/http/controllers/health.controller";
import { SystemInfoController } from "@system-infrastructure/http/controllers/system-info.controller";
import { ReadinessController } from "@system-infrastructure/http/controllers/readiness.controller";
import { FeatureFlagsController } from "@system-infrastructure/http/controllers/feature-flags.controller";
import { ClockController } from "@system-infrastructure/http/controllers/clock.controller";

export function createSystemRoutes(controllers: {
    clockController: ClockController,
    featureFlagsController: FeatureFlagsController,
    healthController: HealthController,
    readinessController: ReadinessController,
    systemInfoController: SystemInfoController,
}): Router {
    const router = Router();

    router.get("/clock", expressAdapter(controllers.clockController));
    router.get("/feature-flags", expressAdapter(controllers.featureFlagsController));
    router.get("/health", expressAdapter(controllers.healthController));
    router.get("/readiness", expressAdapter(controllers.readinessController));
    router.get("/system-info", expressAdapter(controllers.systemInfoController));

    return router;
}
