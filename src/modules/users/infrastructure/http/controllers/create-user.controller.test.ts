import { CreateUserController } from "./create-user.controller";
import type { CreateUserUseCase } from "@users-application/use-cases/create-user.use-case";
import { Result } from "@shared-kernel/errors/result";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { UserEntity } from "@users-domain/entities/user.entity";
import { UserAlreadyExistsError } from "@users-application/errors/user-already-exists.error";

const mockUseCase = (): jest.Mocked<CreateUserUseCase> =>
({
    execute: jest.fn()
} as unknown as jest.Mocked<CreateUserUseCase>);


const makeRequest = (body: unknown): HttpRequest => ({
    body,
});

describe("CreateUserController", () => {
    it("should return 201 when user is created successfully", async () => {
        const useCase = mockUseCase();
        const controller = new CreateUserController(useCase);

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
            makeRequest({
                name: "Fidel",
                lastName: "García",
                email: "fidel@test.com",
                dni: "12345678"
            })
        );

        expect(response.statusCode).toBe(201);
        expect(response.body?.status).toBe("success");
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new CreateUserController(useCase);

        const error = new UserAlreadyExistsError("fidel@test.com");

        useCase.execute.mockResolvedValue(
            Result.fail(error)
        );

        const response = await controller.handle(
            makeRequest({
                name: "Fidel",
                lastName: "García",
                email: "fidel@test.com",
                dni: "12345678"
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
            controller.handle(
                makeRequest({
                    email: "invalid-email",
                })
            )
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });
});
