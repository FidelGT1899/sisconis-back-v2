import { createApp } from "./app";
import request from "supertest";

const createMockController = (statusCode: number, body: unknown) => ({
    handle: jest.fn().mockResolvedValue({
        statusCode,
        body
    })
});

const fakeUsersControllers = {
    getUsersController: createMockController(200, { users: [] }),
    getUserController: createMockController(200, { user: {} }),
    createUserController: createMockController(201, { user: {} }),
    updateUserController: createMockController(200, { user: {} }),
    deleteUserController: createMockController(204, {})
};

const fakeSystemControllers = {
    clockController: createMockController(200, {
        timestamp: new Date().toISOString(),
        iso: new Date().toISOString(),
        unix: Math.floor(Date.now() / 1000)
    }),
    featureFlagsController: createMockController(200, []),
    healthController: createMockController(200, {
        status: "ok",
        timestamp: new Date().toISOString()
    }),
    readinessController: createMockController(200, {
        status: "ready",
        checks: {},
        timestamp: new Date().toISOString()
    }),
    systemInfoController: createMockController(200, {
        name: "sisconis-api",
        version: "dev",
        environment: "test",
        uptime: 0
    })
};

describe("App bootstrap", () => {
    it("should respond 200 on health check", async () => {
        const app = createApp({
            users: fakeUsersControllers,
            system: fakeSystemControllers
        });

        const response = await request(app).get("/v1/api/health");

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status", "ok");
        expect(response.body).toHaveProperty("timestamp");
    });
});
