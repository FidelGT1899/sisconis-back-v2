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

    /**
    * @openapi
    * /v1/api/clock:
    *   get:
    *     summary: Get system current time
    *     tags:
    *       - System
    *     responses:
    *       200:
    *         description: Returns the current server time and timezone
    */
    router.get("/clock", expressAdapter(controllers.clockController));

    /**
    * @openapi
    * /v1/api/feature-flags:
    *   get:
    *     summary: Get active feature flags
    *     tags:
    *       - System
    *     responses:
    *       200:
    *         description: List of available configuration flags and their status
    */
    router.get("/feature-flags", expressAdapter(controllers.featureFlagsController));

    /**
    * @openapi
    * /v1/api/health:
    *   get:
    *     summary: Health check
    *     tags:
    *       - System
    *     responses:
    *       200:
    *         description: API is healthy
    */
    router.get("/health", expressAdapter(controllers.healthController));

    /**
    * @openapi
    * /v1/api/readiness:
    *   get:
    *     summary: Readiness check
    *     tags:
    *       - System
    *     responses:
    *       200:
    *         description: API is ready to accept traffic (dependencies are up)
    *       503:
    *         description: Service unavailable or starting up
    */
    router.get("/readiness", expressAdapter(controllers.readinessController));

    /**
    * @openapi
    * /v1/api/system-info:
    *   get:
    *     summary: Get system information
    *     tags:
    *       - System
    *     responses:
    *       200:
    *         description: Returns technical details about the environment and version
    */
    router.get("/system-info", expressAdapter(controllers.systemInfoController));

    return router;
}
