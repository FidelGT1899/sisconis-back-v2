import { GetUsersController } from "./get-users.controller";
import type { GetUsersUseCase } from "@users-application/use-cases/get-users.use-case";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserEntity } from "@modules/users/domain/entities/user.entity";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

const mockUseCase = (): jest.Mocked<GetUsersUseCase> =>
({
    execute: jest.fn()
} as unknown as jest.Mocked<GetUsersUseCase>);

const makeRequest = (query?: unknown): HttpRequest => ({
    query
});

describe("GetUsersController", () => {
    it("should return 200 with paginated users", async () => {
        const useCase = mockUseCase();
        const controller = new GetUsersController(useCase);

        const users = [
            {
                getId: jest.fn().mockReturnValue("user-1"),
                getName: jest.fn().mockReturnValue("Fidel"),
                getLastName: jest.fn().mockReturnValue("García"),
                getEmail: jest.fn().mockReturnValue("fidel@test.com"),
                getCreatedAt: jest.fn().mockReturnValue(new Date()),
                getUpdatedAt: jest.fn().mockReturnValue(new Date()),
            },
            {
                getId: jest.fn().mockReturnValue("user-2"),
                getName: jest.fn().mockReturnValue("Juan"),
                getLastName: jest.fn().mockReturnValue("Pérez"),
                getEmail: jest.fn().mockReturnValue("juan@test.com"),
                getCreatedAt: jest.fn().mockReturnValue(new Date()),
                getUpdatedAt: jest.fn().mockReturnValue(new Date()),
            },
        ] as unknown as UserEntity[];

        useCase.execute.mockResolvedValue(
            Result.ok({
                items: users,
                total: 10,
                page: 1,
                limit: 2,
            })
        );

        const response = await controller.handle(
            makeRequest({
                page: "1",
                limit: "2",
            })
        );

        expect(useCase.execute).toHaveBeenCalledWith({
            page: 1,
            limit: 2,
            orderBy: "createdAt",
            direction: "desc",
            search: "",
        });

        expect(response.statusCode).toBe(200);
        expect(response.body?.status).toBe("success");
        expect(response.body?.data).toHaveLength(2);
        expect(response.body?.meta).toEqual({
            page: 1,
            limit: 2,
            total: 10,
            totalPages: 5,
        });
    });

    it("should throw validation error when query params are invalid", async () => {
        const useCase = mockUseCase();
        const controller = new GetUsersController(useCase);

        await expect(
            controller.handle(
                makeRequest({
                    page: "invalid",
                    limit: -1,
                })
            )
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new GetUsersController(useCase);

        const error = new UserNotFoundError();

        useCase.execute.mockResolvedValue(
            Result.fail(error)
        );

        const response = await controller.handle(
            makeRequest({
                page: "1",
                limit: "10",
            })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
