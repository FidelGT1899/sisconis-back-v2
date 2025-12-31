import { createApp } from "./app";
import request from "supertest";

const fakeController = {
    handle: jest.fn()
};

const fakeUsersControllers = {
    getUsersController: fakeController,
    getUserController: fakeController,
    createUserController: fakeController,
    updateUserController: fakeController,
    deleteUserController: fakeController
};

describe("App bootstrap", () => {
    it("should respond 200 on health check", async () => {
        const app = createApp({
            users: fakeUsersControllers
        });

        const response = await request(app).get("/v1/api/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });
});
