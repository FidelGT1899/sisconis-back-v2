import { CreateUserController } from "./create-user.controller";
import type { CreateUserUseCase } from "@users-application/use-cases/user/create-user.use-case";
import { Result } from "@shared-kernel/errors/result";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { UserAlreadyExistsError } from "@users-application/errors/user-already-exists.error";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";
import { makeUserEntity } from "@users-tests/factories/user.factory";

const mockUseCase = (): jest.Mocked<CreateUserUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<CreateUserUseCase>);

const makeRequest = (body?: unknown): HttpRequest => ({
    ...(body !== undefined && { body }),
});

describe("CreateUserController", () => {
    it("should return 201 when user is created successfully", async () => {
        const useCase = mockUseCase();
        const controller = new CreateUserController(useCase);
        const dto = UserResponseMapper.toDto(makeUserEntity());
        useCase.execute.mockResolvedValue(Result.ok(dto));

        const validRoleId = "550e8400-e29b-41d4-a716-446655440000";

        const response = await controller.handle(
            makeRequest({
                name: "Fidel",
                lastName: "García",
                email: "fidel@test.com",
                dni: "12345678",
                roleId: validRoleId
            })
        );

        expect(response.statusCode).toBe(201);
        expect(response.body?.status).toBe("success");
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new CreateUserController(useCase);
        const error = new UserAlreadyExistsError("email", "fidel@test.com");
        useCase.execute.mockResolvedValue(Result.fail(error));

        const validRoleId = "550e8400-e29b-41d4-a716-446655440000";

        const response = await controller.handle(
            makeRequest({
                name: "Fidel",
                lastName: "García",
                email: "fidel@test.com",
                dni: "12345678",
                roleId: validRoleId
            })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });

    it("should throw validation error when request body is invalid", async () => {
        const useCase = mockUseCase();
        const controller = new CreateUserController(useCase);

        await expect(
            controller.handle(makeRequest({ email: "invalid-email" }))
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should throw validation error when required fields are missing", async () => {
        const useCase = mockUseCase();
        const controller = new CreateUserController(useCase);

        await expect(
            controller.handle(makeRequest({}))
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });
});
