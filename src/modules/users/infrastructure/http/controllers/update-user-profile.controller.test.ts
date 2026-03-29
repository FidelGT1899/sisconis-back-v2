import { UpdateUserProfileController } from "./update-user-profile.controller";
import type { UpdateUserProfileUseCase } from "@users-application/use-cases/user/update-user-profile.use-case";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";
import { makeUserEntity } from "@users-tests/factories/user.factory";

const mockUseCase = (): jest.Mocked<UpdateUserProfileUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<UpdateUserProfileUseCase>);

const makeRequest = (
    params?: Record<string, string>,
    body?: unknown
): HttpRequest => ({
    ...(params && { params }),
    ...(body !== undefined && { body }),
});

describe("UpdateUserProfileController", () => {
    it("should return 200 when profile is updated successfully", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserProfileController(useCase);
        const dto = UserResponseMapper.toDto(makeUserEntity());
        useCase.execute.mockResolvedValue(Result.ok(dto));

        const response = await controller.handle(
            makeRequest({ id: "user-id" }, { name: "Jane", lastName: "Smith" })
        );

        expect(useCase.execute).toHaveBeenCalledWith({
            id: "user-id",
            name: "Jane",
            lastName: "Smith"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.status).toBe("success");
    });

    it("should return 400 when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserProfileController(useCase);

        const response = await controller.handle(
            makeRequest({}, { name: "Jane" })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should throw validation error when body is empty", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserProfileController(useCase);

        await expect(
            controller.handle(makeRequest({ id: "user-id" }, {}))
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return error when user is not found", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserProfileController(useCase);
        const error = new UserNotFoundError("user-id");
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeRequest({ id: "user-id" }, { name: "Jane" })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
