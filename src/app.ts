import express from "express";
import { createUserRoutes } from "@modules/users/infrastructure/http/routes/user.routes";
import { globalErrorMiddleware } from "@shared-infrastructure/http/middlewares/error.middleware";
import type { CreateUserController } from "@modules/users/infrastructure/http/controllers/create-user.controller";
import type { Express } from "express";

export function createApp(userController: CreateUserController): Express {
    const app = express();

    app.use(express.json());

    // API base path
    const apiRouter = express.Router();

    // health check
    apiRouter.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });

    // routes
    apiRouter.use("/users", createUserRoutes(userController));

    // mount api
    app.use("/api", apiRouter);

    // error middleware
    app.use(globalErrorMiddleware);

    return app;
}
