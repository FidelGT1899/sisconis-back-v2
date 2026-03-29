import { ResetUserPasswordController } from "./reset-user-password.controller";
import type { ResetUserPasswordUseCase } from "@users-application/use-cases/user/reset-user-password.use-case";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

const mockUseCase = (): jest.Mocked<ResetUserPasswordUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<ResetUserPasswordUseCase>);

const makeRequest = (params?: Record<string, string>): HttpRequest => ({
    ...(params && { params }),
});

describe("ResetUserPasswordController", () => {
    it("should return 204 when password is reset successfully", async () => {
        const useCase = mockUseCase();
        const controller = new ResetUserPasswordController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(undefined));

        const response = await controller.handle(
            makeRequest({ id: "user-id" })
        );

        expect(useCase.execute).toHaveBeenCalledWith("user-id");
        expect(response.statusCode).toBe(204);
        expect(response.body).toBeUndefined();
    });

    it("should return 400 when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new ResetUserPasswordController(useCase);

        const response = await controller.handle(makeRequest({}));

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should return 400 when id param is empty string", async () => {
        const useCase = mockUseCase();
        const controller = new ResetUserPasswordController(useCase);

        const response = await controller.handle(makeRequest({ id: "" }));

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should return error when user is not found", async () => {
        const useCase = mockUseCase();
        const controller = new ResetUserPasswordController(useCase);
        const error = new UserNotFoundError("non-existent-user");
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeRequest({ id: "non-existent-user" })
        );

        expect(useCase.execute).toHaveBeenCalledWith("non-existent-user");
        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });

    it("should bubble up unexpected errors", async () => {
        const useCase = mockUseCase();
        const controller = new ResetUserPasswordController(useCase);
        useCase.execute.mockRejectedValue(new Error("Database connection failed"));

        await expect(
            controller.handle(makeRequest({ id: "user-id" }))
        ).rejects.toThrow("Database connection failed");
    });
});
