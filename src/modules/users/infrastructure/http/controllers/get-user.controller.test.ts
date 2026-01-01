import { GetUserController } from "./get-user.controller";
import type { GetUserUseCase } from "@users-application/use-cases/get-user.use-case";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserEntity } from "@modules/users/domain/entities/user.entity";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

const mockUseCase = (): jest.Mocked<GetUserUseCase> =>
({
    execute: jest.fn()
} as unknown as jest.Mocked<GetUserUseCase>);

const makeRequest = (params?: Record<string, unknown>): HttpRequest => ({
    params
});

describe("GetUserController", () => {
    it("should return 200 and user data when user is found", async () => {
        const useCase = mockUseCase();
        const controller = new GetUserController(useCase);

        const mockUser = {
            getId: jest.fn().mockReturnValue("user-id"),
            getName: jest.fn().mockReturnValue("Fidel"),
            getLastName: jest.fn().mockReturnValue("García"),
            getEmail: jest.fn().mockReturnValue("fidel@test.com"),
            getCreatedAt: jest.fn().mockReturnValue(new Date()),
            getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        } as unknown as UserEntity;

        useCase.execute.mockResolvedValue(
            Result.ok(mockUser)
        );

        const response = await controller.handle(
            makeRequest({ id: "user-id" })
        );

        expect(useCase.execute).toHaveBeenCalledWith("user-id");
        expect(response.statusCode).toBe(200);
        expect(response.body?.status).toBe("success");
        expect(response.body?.data).toBeDefined();
    });

    it("should return error when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new GetUserController(useCase);

        const response = await controller.handle(
            makeRequest({})
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new GetUserController(useCase);

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
