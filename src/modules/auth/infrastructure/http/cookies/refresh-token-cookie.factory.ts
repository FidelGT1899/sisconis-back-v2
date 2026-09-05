import { env } from "@shared-infrastructure/config/env";
import { AuthPolicy } from "@auth-domain/constants/auth-policy";
import type { HttpCookie } from "@shared-infrastructure/http/ports/controller";

const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
// TODO: Harcodeado a proposito
// Agregar API_PREFIX en el env/config para esto y para el app.ts
const REFRESH_TOKEN_COOKIE_PATH = "/v1/api/auth/refresh";

function baseOptions(): NonNullable<HttpCookie["options"]> {
    return {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        path: REFRESH_TOKEN_COOKIE_PATH,
    };
}

export const RefreshTokenCookie = {
    /** Cookie para setear tras login o rotación de refresh token */
    build(value: string): HttpCookie {
        return {
            name: REFRESH_TOKEN_COOKIE_NAME,
            value,
            options: {
                ...baseOptions(),
                maxAge: AuthPolicy.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
            },
        };
    },

    /** Cookie para invalidar en logout — mismos atributos + maxAge: 0 para que el navegador la elimine */
    clear(): HttpCookie {
        return {
            name: REFRESH_TOKEN_COOKIE_NAME,
            value: "",
            options: {
                ...baseOptions(),
                maxAge: 0,
            },
        };
    },
};