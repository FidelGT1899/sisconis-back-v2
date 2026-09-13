import { UpdateUserProfileController } from "@users-infrastructure/http/controllers/update-user-profile.controller";
import type { UpdateUserProfileUseCase } from "@users-application/use-cases/user/update-user-profile.use-case";
import { makeHttpRequest } from "@tests-factories/http-request.factory";
import { Result } from "@shared-kernel/errors/result";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";
import { makeUserEntity } from "@tests-factories/users/user.factory";

const mockUseCase = (): jest.Mocked<UpdateUserProfileUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<UpdateUserProfileUseCase>);

describe("UpdateUserProfileController", () => {
    it("should return 200 when profile is updated successfully", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserProfileController(useCase);
        const dto = UserResponseMapper.toDto(makeUserEntity());
        useCase.execute.mockResolvedValue(Result.ok(dto));

        const response = await controller.handle(
            makeHttpRequest({
                params: { id: "user-id" },
                body: { name: "Jane", lastName: "Smith" }
            })
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
            makeHttpRequest({
                body: { name: "Jane" }
            })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should throw validation error when body is empty", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserProfileController(useCase);

        await expect(
            controller.handle(makeHttpRequest({
                params: { id: "user-id" },
                body: {}
            }))
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return error when user is not found", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserProfileController(useCase);
        const error = new UserNotFoundError("user-id");
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({
                params: { id: "user-id" },
                body: { name: "Jane" }
            })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
