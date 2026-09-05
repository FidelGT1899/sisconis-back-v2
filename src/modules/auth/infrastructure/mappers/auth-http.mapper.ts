import type { LoginResponseDto } from "@auth-application/dtos/login-response.dto";
import type { RefreshTokenResponseDto } from "@auth-application/dtos/refresh-token-response.dto";

export interface LoginHttpResponse {
    accessToken: string;
    sessionId: string;
    expiresAt: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export interface RefreshTokenHttpResponse {
    accessToken: string;
    expiresAt: string;
}

export class AuthHttpMapper {
    static toLoginResponse(dto: LoginResponseDto): LoginHttpResponse {
        return {
            accessToken: dto.accessToken,
            sessionId: dto.sessionId,
            expiresAt: dto.expiresAt.toISOString(),
            user: dto.user,
        };
    }

    // Nota: refreshToken deliberadamente excluido — va solo en Set-Cookie
    static toRefreshTokenResponse(dto: RefreshTokenResponseDto): RefreshTokenHttpResponse {
        return {
            accessToken: dto.accessToken,
            expiresAt: dto.expiresAt.toISOString(),
        };
    }
}