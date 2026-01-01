import { UpdateUserController } from "./update-user.controller";
import type { UpdateUserUseCase } from "@users-application/use-cases/update-user.use-case";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserEntity } from "@modules/users/domain/entities/user.entity";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

const mockUseCase = (): jest.Mocked<UpdateUserUseCase> =>
({
    execute: jest.fn()
} as unknown as jest.Mocked<UpdateUserUseCase>);

const makeRequest = (
    params?: Record<string, unknown>,
    body?: unknown
): HttpRequest => ({
    params,
    body,
});

describe("UpdateUserController", () => {
    it("should return 200 when user is updated successfully", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserController(useCase);

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
            makeRequest(
                { id: "user-id" },
                {
                    name: "Nuevo Nombre",
                    lastName: "Nuevo Apellido",
                }
            )
        );

        expect(useCase.execute).toHaveBeenCalledWith({
            id: "user-id",
            name: "Nuevo Nombre",
            lastName: "Nuevo Apellido",
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.status).toBe("success");
    });

    it("should return error when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserController(useCase);

        const response = await controller.handle(
            makeRequest({}, { name: "Algo" })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should throw validation error when request body is invalid", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserController(useCase);

        await expect(
            controller.handle(
                makeRequest(
                    { id: "user-id" },
                    {
                        email: "invalid-email",
                    }
                )
            )
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserController(useCase);

        const error = new UserNotFoundError("user-id");

        useCase.execute.mockResolvedValue(
            Result.fail(error)
        );

        const response = await controller.handle(
            makeRequest(
                { id: "user-id" },
                { name: "Nuevo Nombre" }
            )
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
