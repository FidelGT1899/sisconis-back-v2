import { AuthHttpMapper } from '@auth-infrastructure/mappers/auth-http.mapper';
import type { LoginResponseDto } from '@auth-application/dtos/login-response.dto';
import type { RefreshTokenResponseDto } from '@auth-application/dtos/refresh-token-response.dto';

describe('AuthHttpMapper', () => {
    describe('toLoginResponse', () => {
        it('should map login DTO to HTTP response', () => {
            const dto: LoginResponseDto = {
                accessToken: 'jwt-access-token',
                refreshToken: 'refresh-token-value',
                sessionId: 'session-123',
                expiresAt: new Date('2024-01-08T00:00:00.000Z'),
                user: {
                    id: 'user-123',
                    email: 'john@example.com',
                    role: 'Admin',
                },
            };

            const result = AuthHttpMapper.toLoginResponse(dto);

            expect(result).toEqual({
                accessToken: 'jwt-access-token',
                sessionId: 'session-123',
                expiresAt: '2024-01-08T00:00:00.000Z',
                user: {
                    id: 'user-123',
                    email: 'john@example.com',
                    role: 'Admin',
                },
            });
        });

        it('should not include refreshToken in HTTP response', () => {
            const dto: LoginResponseDto = {
                accessToken: 'jwt-access-token',
                refreshToken: 'refresh-token-value',
                sessionId: 'session-123',
                expiresAt: new Date('2024-01-08'),
                user: { id: 'u', email: 'e', role: 'r' },
            };

            const result = AuthHttpMapper.toLoginResponse(dto);

            expect(result).not.toHaveProperty('refreshToken');
        });
    });

    describe('toRefreshTokenResponse', () => {
        it('should map refresh token DTO to HTTP response', () => {
            const dto: RefreshTokenResponseDto = {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
                expiresAt: new Date('2024-01-08T00:00:00.000Z'),
            };

            const result = AuthHttpMapper.toRefreshTokenResponse(dto);

            expect(result).toEqual({
                accessToken: 'new-access-token',
                expiresAt: '2024-01-08T00:00:00.000Z',
            });
        });

        it('should not include refreshToken in HTTP response', () => {
            const dto: RefreshTokenResponseDto = {
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
                expiresAt: new Date('2024-01-08'),
            };

            const result = AuthHttpMapper.toRefreshTokenResponse(dto);

            expect(result).not.toHaveProperty('refreshToken');
        });
    });
});
