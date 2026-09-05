import express from "express";
import cookieParser from "cookie-parser";
import type { ErrorRequestHandler, Express, Router } from "express";
import { env } from "@shared-infrastructure/config/env";

export function createApp(
    routers: {
        usersRouter: Router;
        rolesRouter: Router;
        systemRouter: Router;
        authRouter: Router;
        globalErrorMiddleware: ErrorRequestHandler;
    }
): Express {
    const app = express();

    app.set("trust proxy", env.TRUST_PROXY === "true");

    app.use(express.json());
    app.use(cookieParser());

    // API base path
    const apiRouter = express.Router();

    // routes
    apiRouter.use("/users", routers.usersRouter);
    apiRouter.use("/", routers.systemRouter);
    apiRouter.use("/roles", routers.rolesRouter);
    apiRouter.use("/auth", routers.authRouter);

    // mount api
    app.use("/v1/api", apiRouter);

    // error middleware
    app.use(routers.globalErrorMiddleware);

    return app;
}
