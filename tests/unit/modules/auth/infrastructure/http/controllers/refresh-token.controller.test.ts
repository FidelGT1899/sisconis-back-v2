import { RefreshTokenController } from '@auth-infrastructure/http/controllers/refresh-token.controller';
import type { RefreshTokenUseCase } from '@auth-application/use-cases/refresh-token.use-case';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { Result } from '@shared-kernel/errors/result';
import { SessionNotFoundError } from '@auth-application/errors/session-not-found.error';
import { InactiveSessionError } from '@auth-domain/errors/inactive-session.error';

const mockUseCase = (): jest.Mocked<RefreshTokenUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<RefreshTokenUseCase>);

const VALID_UUID = '12345678-1234-4234-a234-123456789012';

const refreshResponse = {
    accessToken: 'new-access-token',
    refreshToken: 'b'.repeat(64),
    expiresAt: new Date('2024-01-08'),
};

describe('RefreshTokenController', () => {
    it('should return 200 with new tokens on success', async () => {
        const useCase = mockUseCase();
        const controller = new RefreshTokenController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(refreshResponse));

        const response = await controller.handle(
            makeHttpRequest({
                body: { sessionId: VALID_UUID },
                cookies: { refreshToken: 'a'.repeat(64) },
            })
        );

        expect(useCase.execute).toHaveBeenCalledWith({
            sessionId: VALID_UUID,
            refreshToken: 'a'.repeat(64),
        });
        expect(response.statusCode).toBe(200);
        expect(response.body?.status).toBe('success');
        expect(response.cookies).toBeDefined();
        expect(response.cookies).toHaveLength(1);
        expect(response.cookies![0]!.name).toBe('refreshToken');
    });

    it('should return 401 when refresh token cookie is missing', async () => {
        const useCase = mockUseCase();
        const controller = new RefreshTokenController(useCase);

        const response = await controller.handle(
            makeHttpRequest({
                body: { sessionId: VALID_UUID },
            })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(401);
        expect(response.body?.status).toBe('error');
        expect(response.body?.code).toBe('MISSING_REFRESH_TOKEN');
    });

    it('should return error when session not found', async () => {
        const useCase = mockUseCase();
        const controller = new RefreshTokenController(useCase);
        const error = new SessionNotFoundError();
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({
                body: { sessionId: VALID_UUID },
                cookies: { refreshToken: 'a'.repeat(64) },
            })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe('error');
    });

    it('should return error when session is inactive', async () => {
        const useCase = mockUseCase();
        const controller = new RefreshTokenController(useCase);
        const error = new InactiveSessionError();
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({
                body: { sessionId: VALID_UUID },
                cookies: { refreshToken: 'a'.repeat(64) },
            })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe('error');
    });

    it('should throw when body is missing sessionId', async () => {
        const useCase = mockUseCase();
        const controller = new RefreshTokenController(useCase);

        await expect(
            controller.handle(
                makeHttpRequest({
                    body: {},
                    cookies: { refreshToken: 'a'.repeat(64) },
                })
            )
        ).rejects.toThrow();
    });
});
