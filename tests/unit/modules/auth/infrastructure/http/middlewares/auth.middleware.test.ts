import { mock } from 'jest-mock-extended';
import type { Request, Response } from 'express';

import { createAuthMiddleware } from '@auth-infrastructure/http/middlewares/auth.middleware';
import type { ITokenService } from '@auth-domain/ports/token.service.interface';
import type { IAccessTokenBlacklist } from '@auth-domain/ports/access-token-blacklist.interface';
import { TokenExpiredError } from '@auth-domain/errors/token-expired.error';
import { TokenVerificationFailedError } from '@auth-domain/errors/token-verification-failed.error';
import { Result } from '@shared-kernel/errors/result';

const makeRequest = (overrides: Partial<{ headers: Record<string, string> }> = {}): Request =>
    ({ headers: overrides.headers ?? {} }) as unknown as Request;

const makeResponse = (): Response => {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
    return res;
};

describe('createAuthMiddleware', () => {
    let mockTokenService: ReturnType<typeof mock<ITokenService>>;
    let mockBlacklist: ReturnType<typeof mock<IAccessTokenBlacklist>>;
    let middleware: ReturnType<typeof createAuthMiddleware>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockTokenService = mock<ITokenService>();
        mockBlacklist = mock<IAccessTokenBlacklist>();
        middleware = createAuthMiddleware(mockTokenService, mockBlacklist);
    });

    it('should return 401 when authorization header is missing', async () => {
        const req = makeRequest({ headers: {} });
        const res = makeResponse();
        const next = jest.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        const calls = (res.json as jest.Mock).mock.calls as unknown[][];
        const body = calls[0]![0] as { error: { code: string } };
        expect(body.error.code).toBe('MISSING_ACCESS_TOKEN');
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header lacks Bearer prefix', async () => {
        const req = makeRequest({ headers: { authorization: 'Basic abc123' } });
        const res = makeResponse();
        const next = jest.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        const calls = (res.json as jest.Mock).mock.calls as unknown[][];
        const body = calls[0]![0] as { error: { code: string } };
        expect(body.error.code).toBe('MISSING_ACCESS_TOKEN');
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 TOKEN_EXPIRED when token is expired', async () => {
        mockTokenService.verifyAccessToken.mockReturnValue(
            Result.fail(new TokenExpiredError()),
        );

        const req = makeRequest({ headers: { authorization: 'Bearer expired-token' } });
        const res = makeResponse();
        const next = jest.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        const calls = (res.json as jest.Mock).mock.calls as unknown[][];
        const body = calls[0]![0] as { error: { code: string } };
        expect(body.error.code).toBe('TOKEN_EXPIRED');
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 TOKEN_INVALID when token verification fails', async () => {
        mockTokenService.verifyAccessToken.mockReturnValue(
            Result.fail(new TokenVerificationFailedError()),
        );

        const req = makeRequest({ headers: { authorization: 'Bearer invalid-token' } });
        const res = makeResponse();
        const next = jest.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        const calls = (res.json as jest.Mock).mock.calls as unknown[][];
        const body = calls[0]![0] as { error: { code: string } };
        expect(body.error.code).toBe('TOKEN_INVALID');
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 SESSION_REVOKED when session is blacklisted', async () => {
        mockTokenService.verifyAccessToken.mockReturnValue(
            Result.ok({ id: 'user-1', email: 'test@test.com', role: 'Admin', sessionId: 'sess-1' }),
        );
        mockBlacklist.isBlacklisted.mockResolvedValue(true);

        const req = makeRequest({ headers: { authorization: 'Bearer valid-token' } });
        const res = makeResponse();
        const next = jest.fn();

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        const calls = (res.json as jest.Mock).mock.calls as unknown[][];
        const body = calls[0]![0] as { error: { code: string } };
        expect(body.error.code).toBe('SESSION_REVOKED');
        expect(next).not.toHaveBeenCalled();
    });

    it('should populate req.auth and call next when token is valid and not blacklisted', async () => {
        const payload = { id: 'user-1', email: 'test@test.com', role: 'Admin', sessionId: 'sess-1' };
        mockTokenService.verifyAccessToken.mockReturnValue(Result.ok(payload));
        mockBlacklist.isBlacklisted.mockResolvedValue(false);

        const req = makeRequest({ headers: { authorization: 'Bearer valid-token' } });
        const res = makeResponse();
        const next = jest.fn();

        await middleware(req, res, next);

        expect(req.auth).toEqual({
            userId: 'user-1',
            email: 'test@test.com',
            role: 'Admin',
            sessionId: 'sess-1',
        });
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should extract token from Bearer prefix', async () => {
        mockTokenService.verifyAccessToken.mockReturnValue(
            Result.ok({ id: 'u', email: 'e@e.com', role: 'r', sessionId: 's' }),
        );
        mockBlacklist.isBlacklisted.mockResolvedValue(false);

        const req = makeRequest({ headers: { authorization: 'Bearer my-jwt-token' } });
        const res = makeResponse();
        const next = jest.fn();

        await middleware(req, res, next);

        expect(mockTokenService.verifyAccessToken).toHaveBeenCalledWith('my-jwt-token');
    });
});
