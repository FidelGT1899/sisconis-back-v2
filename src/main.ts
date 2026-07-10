import "dotenv/config";
import "reflect-metadata";

import type { ErrorRequestHandler, Router } from "express";

import { container } from "@shared-infrastructure/ioc/container";
import { TYPES } from "@shared-infrastructure/ioc/types";
import { createGracefulShutdown } from "@shared-infrastructure/lifecycle/graceful-shutdown";
import type { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";
import type { ILogger } from "@shared-domain/ports/logger";

import { createApp } from "./app";

function bootstrap(): void {
    const usersRouter = container.get<Router>(TYPES.UsersRouter);
    const systemRouter = container.get<Router>(TYPES.SystemRouter);
    const rolesRouter = container.get<Router>(TYPES.RolesRouter);
    const globalErrorMiddleware = container.get<ErrorRequestHandler>(TYPES.GlobalErrorMiddleware);

    const app = createApp({
        usersRouter,
        rolesRouter,
        systemRouter,
        globalErrorMiddleware
    });

    const PORT = process.env.PORT ?? 3000;

    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    const logger = container.get<ILogger>(TYPES.Logger);
    const prismaService = container.get<PrismaService>(TYPES.PrismaService);

    const shutdown = createGracefulShutdown({
        server,
        resources: [prismaService],
        logger,
        timeoutMs: 10_000,
    });

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
}

try {
    bootstrap();
} catch (error) {
    console.error("Fatal error during bootstrap", error);
    process.exit(1);
}