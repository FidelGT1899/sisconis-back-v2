import { RefreshTokenCookie } from '@auth-infrastructure/http/cookies/refresh-token-cookie.factory';
import { AuthPolicy } from '@auth-domain/constants/auth-policy';

describe('RefreshTokenCookie', () => {
    describe('build', () => {
        it('should create a cookie with the correct name and value', () => {
            const cookie = RefreshTokenCookie.build('my-refresh-token');

            expect(cookie.name).toBe('refreshToken');
            expect(cookie.value).toBe('my-refresh-token');
        });

        it('should set httpOnly to true', () => {
            const cookie = RefreshTokenCookie.build('token');

            expect(cookie.options?.httpOnly).toBe(true);
        });

        it('should set sameSite to strict', () => {
            const cookie = RefreshTokenCookie.build('token');

            expect(cookie.options?.sameSite).toBe('strict');
        });

        it('should set correct path', () => {
            const cookie = RefreshTokenCookie.build('token');

            expect(cookie.options?.path).toBe('/v1/api/auth/refresh');
        });

        it('should set maxAge based on AuthPolicy', () => {
            const cookie = RefreshTokenCookie.build('token');
            const expectedMaxAge = AuthPolicy.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

            expect(cookie.options?.maxAge).toBe(expectedMaxAge);
        });

        it('should pin maxAge to the literal refresh TTL (7 days)', () => {
            const cookie = RefreshTokenCookie.build('token');

            expect(cookie.options?.maxAge).toBe(604800000);
        });
    });

    describe('clear', () => {
        it('should create a cookie with empty value and maxAge 0', () => {
            const cookie = RefreshTokenCookie.clear();

            expect(cookie.name).toBe('refreshToken');
            expect(cookie.value).toBe('');
            expect(cookie.options?.maxAge).toBe(0);
        });

        it('should preserve httpOnly and sameSite options', () => {
            const cookie = RefreshTokenCookie.clear();

            expect(cookie.options?.httpOnly).toBe(true);
            expect(cookie.options?.sameSite).toBe('strict');
            expect(cookie.options?.path).toBe('/v1/api/auth/refresh');
        });
    });
});
