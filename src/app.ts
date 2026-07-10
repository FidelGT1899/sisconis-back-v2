import express from "express";
import type { ErrorRequestHandler, Express, Router } from "express";

export function createApp(
    routers: {
        usersRouter: Router;
        rolesRouter: Router;
        systemRouter: Router;
        globalErrorMiddleware: ErrorRequestHandler;
    }
): Express {
    const app = express();

    app.use(express.json());

    // API base path
    const apiRouter = express.Router();

    // routes
    apiRouter.use("/users", routers.usersRouter);
    apiRouter.use("/", routers.systemRouter);
    apiRouter.use("/roles", routers.rolesRouter);

    // mount api
    app.use("/v1/api", apiRouter);

    // error middleware
    app.use(routers.globalErrorMiddleware);

    return app;
}
