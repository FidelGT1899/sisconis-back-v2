import express from "express";
import type { Express } from "express";

import { globalErrorMiddleware } from "@shared-infrastructure/http/middlewares/error.middleware";
import { createUserRoutes } from "@users-infrastructure/http/routes/user.routes";

import type { UsersHttpControllers } from "@shared-kernel/ioc/modules/users.module";

export function createApp(
    controllers: {
        users: UsersHttpControllers;
    }
): Express {
    const app = express();

    app.use(express.json());

    // API base path
    const apiRouter = express.Router();

    // health check
    apiRouter.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });

    // routes
    apiRouter.use("/users", createUserRoutes(controllers.users));

    // mount api
    app.use("/v1/api", apiRouter);

    // error middleware
    app.use(globalErrorMiddleware);

    return app;
}
