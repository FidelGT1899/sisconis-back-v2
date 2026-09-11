import { ChangeUserPasswordController } from "@users-infrastructure/http/controllers/change-user-password.controller";
import type { ChangeUserPasswordUseCase } from "@users-application/use-cases/user/change-user-password.use-case";
import { makeHttpRequest } from "@tests-factories/http-request.factory";
import { Result } from "@shared-kernel/errors/result";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";
import { makeUserEntity } from "@tests-factories/users/user.factory";

const mockUseCase = (): jest.Mocked<ChangeUserPasswordUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<ChangeUserPasswordUseCase>);

describe("ChangeUserPasswordController", () => {
    it("should return 204 when password is changed successfully", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserPasswordController(useCase);
        const dto = UserResponseMapper.toDto(makeUserEntity());
        useCase.execute.mockResolvedValue(Result.ok(dto));

        const response = await controller.handle(
            makeHttpRequest({ params: { id: "user-id" }, body: { newPassword: "!Passw0rd" } })
        );

        expect(useCase.execute).toHaveBeenCalledWith({
            id: "user-id",
            newPassword: "!Passw0rd"
        });
        expect(response.statusCode).toBe(204);
        expect(response.body).toBeUndefined();
    });

    it("should return 400 when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserPasswordController(useCase);

        const response = await controller.handle(
            makeHttpRequest({ body: { newPassword: "!Passw0rd" } })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should throw validation error when password is too short", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserPasswordController(useCase);

        await expect(
            controller.handle(makeHttpRequest({ params: { id: "user-id" }, body: { newPassword: "Pass1" } }))
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should throw validation error when password is too long", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserPasswordController(useCase);

        await expect(
            controller.handle(makeHttpRequest({ params: { id: "user-id" }, body: { newPassword: "a1".repeat(26) } }))
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should throw validation error when password lacks numbers", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserPasswordController(useCase);

        await expect(
            controller.handle(makeHttpRequest({ params: { id: "user-id" }, body: { newPassword: "onlylowercase" } }))
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should throw validation error when password lacks letters", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserPasswordController(useCase);

        await expect(
            controller.handle(makeHttpRequest({ params: { id: "user-id" }, body: { newPassword: "12345678" } }))
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should throw validation error when newPassword is missing", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserPasswordController(useCase);

        await expect(
            controller.handle(makeHttpRequest({ params: { id: "user-id" }, body: {} }))
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should throw validation error when newPassword is not a string", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserPasswordController(useCase);

        await expect(
            controller.handle(makeHttpRequest({ params: { id: "user-id" }, body: { newPassword: 12345678 } }))
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return error response when use case fails", async () => {
        const useCase = mockUseCase();
        const controller = new ChangeUserPasswordController(useCase);
        const error = new UserNotFoundError("user-id");
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({ params: { id: "user-id" }, body: { newPassword: "!Passw0rd" } })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
