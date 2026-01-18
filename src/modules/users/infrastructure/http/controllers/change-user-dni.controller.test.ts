import { ChangeUserDniController } from "./change-user-dni.controller";
import type { ChangeUserDniUseCase } from "@users-application/use-cases/change-user-dni.use-case";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserEntity } from "@modules/users/domain/entities/user.entity";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

const mockUseCase = (): jest.Mocked<ChangeUserDniUseCase> =>
({
    execute: jest.fn()
} as unknown as jest.Mocked<ChangeUserDniUseCase>);

const makeRequest = (
    params?: Record<string, unknown>,
    body?: unknown
): HttpRequest => ({
    params,
    body,
});

describe("ChangeUserDniController", () => {
    it("should return 200 when user is updated successfully", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);

        const mockUser = {
            getId: jest.fn().mockReturnValue("user-id"),
            getName: jest.fn().mockReturnValue("Fidel"),
            getLastName: jest.fn().mockReturnValue("García"),
            getEmail: jest.fn().mockReturnValue("fidel@test.com"),
            getDni: jest.fn().mockReturnValue("12345678"),
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
                    newDni: "12345678"
                }
            )
        );

        expect(useCase.execute).toHaveBeenCalledWith({
            id: "user-id",
            newDni: "12345678"
        });
        expect(response.statusCode).toBe(204);
        expect(response.body).toBeUndefined();
    });

    it("should return error when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);

        const response = await controller.handle(
            makeRequest({}, { newDni: "Algo" })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should throw validation error when request body is invalid", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);

        await expect(
            controller.handle(
                makeRequest(
                    { id: "user-id" },
                    {
                        newDni: "invalid-dni",
                    }
                )
            )
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should throw validation error when newDni field is missing", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);

        await expect(
            controller.handle(
                makeRequest(
                    { id: "user-id" },
                    {}
                )
            )
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);

        const error = new UserNotFoundError("user-id");

        useCase.execute.mockResolvedValue(
            Result.fail(error)
        );

        const response = await controller.handle(
            makeRequest(
                { id: "user-id" },
                { newDni: "12345678" }
            )
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
