import type { RolesHttpControllers } from "@shared-infrastructure/ioc/modules/roles.module";
import { createApp } from "./app";
import request from "supertest";
import type { SystemHttpControllers } from "@shared-infrastructure/ioc/modules/system.module";
import type { UsersHttpControllers } from "@shared-infrastructure/ioc/modules/users.module";

const createMockController = (statusCode: number, body?: unknown) => ({
    handle: jest.fn().mockResolvedValue({ statusCode, body })
});

const fakeUsersControllers = {
    createUserController: createMockController(201, { status: "success" }),
    getUserController: createMockController(200, { status: "success" }),
    getUsersController: createMockController(200, { status: "success" }),
    updateUserProfileController: createMockController(200, { status: "success" }),
    updateUserByAdminController: createMockController(200, { status: "success" }),
    deleteUserController: createMockController(204),
    resetUserPasswordController: createMockController(204),
    changeUserPasswordController: createMockController(204),
    changeUserDniController: createMockController(204),
    updateUserRoleController: createMockController(204),
    suspendUserController: createMockController(204),
    activateUserController: createMockController(204),
    deactivateUserController: createMockController(204),
} as unknown as UsersHttpControllers;

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
} as unknown as SystemHttpControllers;

const fakeRolesControllers = {
    getRoleController: createMockController(200, { status: "success" }),
    getRolesController: createMockController(200, { status: "success" }),
    createRoleController: createMockController(201, { status: "success" }),
    updateRoleController: createMockController(200, { status: "success" }),
    deleteRoleController: createMockController(204),
    activateRoleController: createMockController(204),
    updateUserRoleController: createMockController(204),
} as unknown as RolesHttpControllers;

describe("App bootstrap", () => {
    it("should respond 200 on health check", async () => {
        const app = createApp({
            users: fakeUsersControllers,
            system: fakeSystemControllers,
            roles: fakeRolesControllers,
        });

        const response = await request(app).get("/v1/api/health");

        expect(response.status).toBe(200);
    });

    it("should respond 404 on unknown route", async () => {
        const app = createApp({
            users: fakeUsersControllers,
            system: fakeSystemControllers,
            roles: fakeRolesControllers,
        });

        const response = await request(app).get("/v1/api/unknown-route");

        expect(response.status).toBe(404);
    });

    it("should handle ZodError from controller via error middleware", async () => {
        const errorController = {
            handle: jest.fn().mockRejectedValue(
                new Error("ZodError simulation")
            )
        };

        const app = createApp({
            users: { ...fakeUsersControllers, getUsersController: errorController } as unknown as UsersHttpControllers,
            system: fakeSystemControllers,
            roles: fakeRolesControllers,
        });

        const response = await request(app).get("/v1/api/users");

        expect(response.status).toBe(500);
    });
});
