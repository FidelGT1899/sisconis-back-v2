import { DeleteUserController } from "./delete-user.controller";
import type { DeleteUserUseCase } from "@users-application/use-cases/delete-user.use-case";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";


const mockUseCase = (): jest.Mocked<DeleteUserUseCase> =>
({
    execute: jest.fn()
} as unknown as jest.Mocked<DeleteUserUseCase>);

const makeRequest = (params?: Record<string, unknown>): HttpRequest => ({
    params
});

describe("DeleteUserController", () => {
    it("should return 204 when user is deleted successfully", async () => {
        const useCase = mockUseCase();
        const controller = new DeleteUserController(useCase);

        useCase.execute.mockResolvedValue(
            Result.ok(undefined)
        );

        const response = await controller.handle(
            makeRequest({ id: "user-id" })
        );

        expect(useCase.execute).toHaveBeenCalledWith("user-id");
        expect(response.statusCode).toBe(204);
    });

    it("should return error when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new DeleteUserController(useCase);

        const response = await controller.handle(
            makeRequest({})
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new DeleteUserController(useCase);

        const error = new UserNotFoundError("user-id");

        useCase.execute.mockResolvedValue(
            Result.fail(error)
        );

        const response = await controller.handle(
            makeRequest({ id: "user-id" })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
