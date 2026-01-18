import express from "express";
import type { Express } from "express";

import type { UsersHttpControllers } from "@shared-infrastructure/ioc/modules/users.module";
import type { SystemHttpControllers } from "@shared-infrastructure/ioc/modules/system.module";
import { globalErrorMiddleware } from "@shared-infrastructure/http/middlewares/error.middleware";
import { setupSwagger } from "@shared-infrastructure/http/swagger/swagger.setup";

import { createUserRoutes } from "@users-infrastructure/http/routes/user.routes";
import { createSystemRoutes } from "@system-infrastructure/http/routes/system.routes";

export function createApp(
    controllers: {
        users: UsersHttpControllers;
        system: SystemHttpControllers;
    }
): Express {
    const app = express();

    setupSwagger(app);

    app.use(express.json());

    // API base path
    const apiRouter = express.Router();

    // routes
    apiRouter.use("/users", createUserRoutes(controllers.users));
    apiRouter.use("/", createSystemRoutes({
        clockController: controllers.system.clockController,
        featureFlagsController: controllers.system.featureFlagsController,
        healthController: controllers.system.healthController,
        readinessController: controllers.system.readinessController,
        systemInfoController: controllers.system.systemInfoController,
    }));

    // mount api
    app.use("/v1/api", apiRouter);

    // error middleware
    app.use(globalErrorMiddleware);

    return app;
}
