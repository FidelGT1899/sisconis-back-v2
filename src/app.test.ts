import { createApp } from "./app";
import request from "supertest";
import type { CreateUserController } from "@users-infrastructure/http/controllers/create-user.controller";
import type { Request, Response } from "express";

const fakeUserController: CreateUserController = {
    run(_req: Request, res: Response): Promise<Response> {
        return Promise.resolve(res.status(501).json({ message: "Not implemented" }));
    },
};

describe("App bootstrap", () => {
    it("should respond 200 on health check", async () => {
        const app = createApp(fakeUserController);

        const response = await request(app).get("/api/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });
});
