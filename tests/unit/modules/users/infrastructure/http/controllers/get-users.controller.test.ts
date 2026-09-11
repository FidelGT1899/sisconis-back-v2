import { GetUsersController } from "@users-infrastructure/http/controllers/get-users.controller";
import type { GetUsersUseCase } from "@users-application/use-cases/user/get-users.use-case";
import type { SuccessResponse } from "@shared-infrastructure/http/ports/controller";
import { makeHttpRequest } from "@tests-factories/http-request.factory";
import { Result } from "@shared-kernel/errors/result";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";
import { makeUserEntity } from "@tests-factories/users/user.factory";

const mockUseCase = (): jest.Mocked<GetUsersUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<GetUsersUseCase>);

describe("GetUsersController", () => {
    it("should return 200 with paginated users", async () => {
        const useCase = mockUseCase();
        const controller = new GetUsersController(useCase);
        const items = [
            UserResponseMapper.toDto(makeUserEntity()),
            UserResponseMapper.toDto(makeUserEntity({ email: 'juan@test.com', dni: '87654321' })),
        ];

        useCase.execute.mockResolvedValue(Result.ok({
            items,
            total: 10,
            page: 1,
            limit: 2,
        }));

        const response = await controller.handle(
            makeHttpRequest({ query: { page: "1", limit: "2" } })
        );

        expect(useCase.execute).toHaveBeenCalledWith({
            page: 1,
            limit: 2,
            orderBy: "createdAt",
            direction: "desc",
            search: "",
        });
        expect(response.statusCode).toBe(200);
        const body = response.body as SuccessResponse<unknown>;
        expect(body.status).toBe("success");
        expect(body.data).toHaveLength(2);
        expect(body.meta).toEqual({
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
            controller.handle(makeHttpRequest({ query: { page: "invalid", limit: -1 } }))
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return 200 with empty list when no users exist", async () => {
        const useCase = mockUseCase();
        const controller = new GetUsersController(useCase);

        useCase.execute.mockResolvedValue(Result.ok({
            items: [],
            total: 0,
            page: 1,
            limit: 10,
        }));

        const response = await controller.handle(makeHttpRequest({ query: {} }));

        expect(response.statusCode).toBe(200);
        const body = response.body as SuccessResponse;
        expect(body.data).toHaveLength(0);
    });
});
