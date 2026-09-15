import { LoginController } from '@auth-infrastructure/http/controllers/login.controller';
import type { LoginUseCase } from '@auth-application/use-cases/login.use-case';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { Result } from '@shared-kernel/errors/result';
import { InvalidCredentialsError } from '@auth-application/errors/invalid-credentials.error';
import { AccountBlockedError } from '@auth-application/errors/account-blocked.error';

const mockUseCase = (): jest.Mocked<LoginUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<LoginUseCase>);

const loginBody = {
    email: 'john.doe@example.com',
    password: 'Secret123',
};

const loginResponse = {
    accessToken: 'jwt-access-token',
    refreshToken: 'a'.repeat(64),
    sessionId: 'session-123',
    expiresAt: new Date('2024-01-08'),
    user: {
        id: 'user-123',
        email: 'john.doe@example.com',
        role: 'Admin',
    },
};

describe('LoginController', () => {
    it('should return 200 with login response', async () => {
        const useCase = mockUseCase();
        const controller = new LoginController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(loginResponse));

        const response = await controller.handle(
            makeHttpRequest({
                body: loginBody,
                ip: '127.0.0.1',
                headers: { 'user-agent': 'Mozilla/5.0' },
            })
        );

        expect(useCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                email: loginBody.email,
                password: loginBody.password,
                ip: '127.0.0.1',
            })
        );
        expect(response.statusCode).toBe(200);
        expect(response.body?.status).toBe('success');
        expect(response.cookies).toBeDefined();
        expect(response.cookies).toHaveLength(1);
        expect(response.cookies![0]!.name).toBe('refreshToken');
        expect(response.cookies![0]!.value).toBe(loginResponse.refreshToken);
        expect(response.cookies![0]!.options?.httpOnly).toBe(true);
        expect(response.cookies![0]!.options?.sameSite).toBe('strict');
        // Pin literal del refresh TTL de la cookie (7 días).
        expect(response.cookies![0]!.options?.maxAge).toBe(604800000);
    });

    it('should return error when credentials are invalid', async () => {
        const useCase = mockUseCase();
        const controller = new LoginController(useCase);
        const error = new InvalidCredentialsError();
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({ body: loginBody })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe('error');
        expect(response.body?.code).toBe(error.code);
    });

    it('should return error when account is blocked', async () => {
        const useCase = mockUseCase();
        const controller = new LoginController(useCase);
        const error = new AccountBlockedError(900);
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({ body: loginBody })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe('error');
        expect(response.body?.code).toBe('ACCOUNT_BLOCKED');
    });

    it('should throw when body is missing required fields', async () => {
        const useCase = mockUseCase();
        const controller = new LoginController(useCase);

        await expect(
            controller.handle(makeHttpRequest({ body: {} }))
        ).rejects.toThrow();
    });

    it('should use unknown ip when not provided', async () => {
        const useCase = mockUseCase();
        const controller = new LoginController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(loginResponse));

        await controller.handle(
            makeHttpRequest({ body: loginBody })
        );

        expect(useCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({ ip: 'unknown' })
        );
    });
});
