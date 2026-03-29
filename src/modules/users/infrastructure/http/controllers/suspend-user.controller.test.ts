import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import type { SuspendUserUseCase } from "@users-application/use-cases/user/suspend-user.use-case";
import { SuspendUserController } from "@users-infrastructure/http/controllers/suspend-user.controller";
import { UserAlreadySuspendedError } from "@users-domain/errors/user-already-suspended.error";

const mockUseCase = (): jest.Mocked<SuspendUserUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<SuspendUserUseCase>);

const makeRequest = (
    params?: Record<string, string>,
    body?: unknown
): HttpRequest => ({
    ...(params && { params }),
    ...(body !== undefined && { body }),
});

describe("SuspendUserController", () => {
    it("should return 204 when user is suspended successfully", async () => {
        const useCase = mockUseCase();
        const controller = new SuspendUserController(useCase);
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
        const controller = new SuspendUserController(useCase);

        const response = await controller.handle(makeRequest({}));

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should return error when user is not found", async () => {
        const useCase = mockUseCase();
        const controller = new SuspendUserController(useCase);
        const error = new UserNotFoundError("user-id");
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeRequest({ id: "user-id" })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });

    it("should return error when user is already suspended", async () => {
        const useCase = mockUseCase();
        const controller = new SuspendUserController(useCase);
        const error = new UserAlreadySuspendedError("user-id");
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeRequest({ id: "user-id" })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
