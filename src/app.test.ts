import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from "express";
import request from "supertest";

import { createApp } from "./app";

const usersRouter = express.Router();
const rolesRouter = express.Router();
const systemRouter = express.Router();

const globalErrorMiddleware: ErrorRequestHandler = jest.fn(
    (
        err: Error,
        _req: Request,
        res: Response,
        _next: NextFunction
    ) => {
        res.status(500).json({
            error: err.message,
        });
    }
);

beforeEach(() => {
    usersRouter.stack = [];
    rolesRouter.stack = [];
    systemRouter.stack = [];
    jest.clearAllMocks();
});

describe("App bootstrap", () => {
    it("should respond 200 on health check", async () => {
        systemRouter.get("/health", (_req, res) => {
            res.sendStatus(200);
        });

        const app = createApp({
            usersRouter,
            rolesRouter,
            systemRouter,
            globalErrorMiddleware,
        });

        const response = await request(app).get("/v1/api/health");

        expect(response.status).toBe(200);
    });

    it("should respond 404 on unknown route", async () => {
        const app = createApp({
            usersRouter,
            rolesRouter,
            systemRouter,
            globalErrorMiddleware,
        });

        const response = await request(app).get("/v1/api/unknown-route");

        expect(response.status).toBe(404);
    });

    it("should handle ZodError from controller via error middleware", async () => {
        usersRouter.get("/", (_req, _res, next) => {
            next(new Error("Boom"));
        });

        const app = createApp({
            usersRouter,
            rolesRouter,
            systemRouter,
            globalErrorMiddleware,
        });

        const response = await request(app).get("/v1/api/users");

        expect(response.status).toBe(500);
        expect(globalErrorMiddleware).toHaveBeenCalled();
    });
});
