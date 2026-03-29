import { ChangeUserDniController } from "./change-user-dni.controller";
import type { ChangeUserDniUseCase } from "@users-application/use-cases/user/change-user-dni.use-case";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { makeUserEntity } from "@users-tests/factories/user.factory";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";

const mockUseCase = (): jest.Mocked<ChangeUserDniUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<ChangeUserDniUseCase>);

const makeRequest = (
    params?: Record<string, string>,
    body?: unknown
): HttpRequest => ({
    ...(params && { params }),
    ...(body !== undefined && { body }),
});

describe("ChangeUserDniController", () => {
    it("should return 204 when DNI is updated successfully", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);
        const dto = UserResponseMapper.toDto(makeUserEntity());

        useCase.execute.mockResolvedValue(Result.ok(dto));

        const response = await controller.handle(
            makeRequest({ id: "user-id" }, { newDni: "12345678" })
        );

        expect(useCase.execute).toHaveBeenCalledWith({ id: "user-id", newDni: "12345678" });
        expect(response.statusCode).toBe(204);
        expect(response.body).toBeUndefined();
    });

    it("should return 400 when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);

        const response = await controller.handle(
            makeRequest({}, { newDni: "12345678" })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should throw validation error when DNI format is invalid", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);

        await expect(
            controller.handle(makeRequest({ id: "user-id" }, { newDni: "invalid-dni" }))
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should throw validation error when newDni is missing", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);

        await expect(
            controller.handle(makeRequest({ id: "user-id" }, {}))
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserDniController(useCase);
        const error = new UserNotFoundError("user-id");

        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeRequest({ id: "user-id" }, { newDni: "12345678" })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
