import { GetUserController } from "./get-user.controller";
import type { GetUserUseCase } from "@users-application/use-cases/user/get-user.use-case";
import type { HttpRequest, SuccessResponse } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";
import { makeUserEntity } from "@users-tests/factories/user.factory";

const mockUseCase = (): jest.Mocked<GetUserUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<GetUserUseCase>);

const makeRequest = (params?: Record<string, string>): HttpRequest => ({
    ...(params && { params }),
});

describe("GetUserController", () => {
    it("should return 200 and user data when user is found", async () => {
        const useCase = mockUseCase();
        const controller = new GetUserController(useCase);
        const dto = UserResponseMapper.toDto(makeUserEntity());
        useCase.execute.mockResolvedValue(Result.ok(dto));

        const response = await controller.handle(
            makeRequest({ id: "user-id" })
        );

        expect(useCase.execute).toHaveBeenCalledWith("user-id");
        expect(response.statusCode).toBe(200);
        const body = response.body as SuccessResponse<unknown>;
        expect(body.status).toBe("success");
        expect(body.data).toBeDefined();
    });

    it("should return 400 when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new GetUserController(useCase);

        const response = await controller.handle(makeRequest({}));

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new GetUserController(useCase);
        const error = new UserNotFoundError("user-id");
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeRequest({ id: "user-id" })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
