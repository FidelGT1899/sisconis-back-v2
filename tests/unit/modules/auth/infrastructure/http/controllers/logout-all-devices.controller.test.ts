import { LogoutAllDevicesController } from '@auth-infrastructure/http/controllers/logout-all-devices.controller';
import type { LogoutAllDevicesUseCase } from '@auth-application/use-cases/logout-all-devices.use-case';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { Result } from '@shared-kernel/errors/result';
import { ApplicationError } from '@shared-kernel/errors/application.error';

class TestError extends ApplicationError {
    constructor() {
        super('INTERNAL_ERROR', 'Oops', 500);
    }
}

const mockUseCase = (): jest.Mocked<LogoutAllDevicesUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<LogoutAllDevicesUseCase>);

describe('LogoutAllDevicesController', () => {
    it('should return 200 with clear cookie on success', async () => {
        const useCase = mockUseCase();
        const controller = new LogoutAllDevicesController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(undefined));

        const response = await controller.handle(
            makeHttpRequest({
                auth: {
                    userId: 'user-123',
                    email: 'test@test.com',
                    role: 'Admin',
                    sessionId: 'session-123',
                },
            })
        );

        expect(useCase.execute).toHaveBeenCalledWith({ userId: 'user-123' });
        expect(response.statusCode).toBe(200);
        expect(response.cookies).toBeDefined();
        expect(response.cookies).toHaveLength(1);
        expect(response.cookies![0]!.name).toBe('refreshToken');
        expect(response.cookies![0]!.options?.maxAge).toBe(0);
    });

    it('should return 401 when auth is missing', async () => {
        const useCase = mockUseCase();
        const controller = new LogoutAllDevicesController(useCase);

        const response = await controller.handle(makeHttpRequest({}));

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(401);
        expect(response.body?.status).toBe('error');
        expect(response.body?.code).toBe('MISSING_AUTH');
    });

    it('should propagate use case errors', async () => {
        const useCase = mockUseCase();
        const controller = new LogoutAllDevicesController(useCase);
        useCase.execute.mockResolvedValue(
            Result.fail(new TestError())
        );

        const response = await controller.handle(
            makeHttpRequest({
                auth: {
                    userId: 'user-123',
                    email: 'test@test.com',
                    role: 'Admin',
                    sessionId: 'session-123',
                },
            })
        );

        expect(response.statusCode).toBe(500);
        expect(response.body?.status).toBe('error');
    });
});
