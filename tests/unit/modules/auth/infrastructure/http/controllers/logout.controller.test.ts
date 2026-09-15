import { LogoutController } from '@auth-infrastructure/http/controllers/logout.controller';
import type { LogoutUseCase } from '@auth-application/use-cases/logout.use-case';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { Result } from '@shared-kernel/errors/result';
import { SessionNotFoundError } from '@auth-application/errors/session-not-found.error';

const mockUseCase = (): jest.Mocked<LogoutUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<LogoutUseCase>);

describe('LogoutController', () => {
    it('should return 200 with clear cookie on success', async () => {
        const useCase = mockUseCase();
        const controller = new LogoutController(useCase);
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

        expect(useCase.execute).toHaveBeenCalledWith({
            sessionId: 'session-123',
            userId: 'user-123',
        });
        expect(response.statusCode).toBe(200);
        expect(response.cookies).toBeDefined();
        expect(response.cookies).toHaveLength(1);
        expect(response.cookies![0]!.name).toBe('refreshToken');
        expect(response.cookies![0]!.options?.maxAge).toBe(0);
    });

    it('should return 401 when auth is missing', async () => {
        const useCase = mockUseCase();
        const controller = new LogoutController(useCase);

        const response = await controller.handle(makeHttpRequest({}));

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(401);
        expect(response.body?.status).toBe('error');
        expect(response.body?.code).toBe('MISSING_AUTH');
    });

    it('should return error when session not found', async () => {
        const useCase = mockUseCase();
        const controller = new LogoutController(useCase);
        const error = new SessionNotFoundError();
        useCase.execute.mockResolvedValue(Result.fail(error));

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

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe('error');
    });
});
