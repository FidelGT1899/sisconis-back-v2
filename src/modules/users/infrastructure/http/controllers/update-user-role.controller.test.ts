import { UpdateUserRoleController } from "./update-user-role.controller";
import type { UpdateUserRoleUseCase } from "@users-application/use-cases/user/update-user-role.use-case";
import type { HttpRequest } from "@shared-infrastructure/http/ports/controller";
import { Result } from "@shared-kernel/errors/result";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { UnauthorizedRoleAssignmentError } from "@users-application/errors/unauthorized-role-assignment.error";

const mockUseCase = (): jest.Mocked<UpdateUserRoleUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<UpdateUserRoleUseCase>);

const makeRequest = (
    params?: Record<string, string>,
    body?: unknown
): HttpRequest => ({
    ...(params && { params }),
    ...(body !== undefined && { body }),
});

const validUserId = "550e8400-e29b-41d4-a716-446655440000";
const validRoleId = "550e8400-e29b-41d4-a716-446655440001";
const validExecutorId = "550e8400-e29b-41d4-a716-446655440002";

describe("UpdateUserRoleController", () => {
    it("should return 204 when role is updated successfully", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserRoleController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(undefined));

        const response = await controller.handle(
            makeRequest(
                { id: validUserId },
                { roleId: validRoleId, executorId: validExecutorId }
            )
        );

        expect(useCase.execute).toHaveBeenCalledWith({
            userId: validUserId,
            newRoleId: validRoleId,
            executorId: validExecutorId
        });
        expect(response.statusCode).toBe(204);
        expect(response.body).toBeUndefined();
    });

    it("should return 400 when id param is missing", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserRoleController(useCase);

        const response = await controller.handle(
            makeRequest({}, { roleId: validRoleId, executorId: validExecutorId })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe("error");
    });

    it("should throw validation error when body is missing required fields", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserRoleController(useCase);

        await expect(
            controller.handle(makeRequest({ id: validUserId }, {}))
        ).rejects.toBeDefined();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it("should return error when user is not found", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserRoleController(useCase);
        const error = new UserNotFoundError(validUserId);
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeRequest(
                { id: validUserId },
                { roleId: validRoleId, executorId: validExecutorId }
            )
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });

    it("should return error when executor is not authorized", async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserRoleController(useCase);
        const error = new UnauthorizedRoleAssignmentError();
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeRequest(
                { id: validUserId },
                { roleId: validRoleId, executorId: validExecutorId }
            )
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe("error");
        expect(response.body?.code).toBe(error.code);
    });
});
