import { ContainerModule } from "inversify";

// Domain ports
import type { ISessionRepository } from "@auth-domain/repositories/session.repository.interface";
import type { ITokenService } from "@auth-domain/ports/token.service.interface";
import type { ITokenGenerator } from "@auth-domain/ports/token-generator.interface";
import type { IRateLimiter } from "@auth-domain/ports/rate-limiter.interface";
import type { IDeviceInfoParser } from "@auth-domain/ports/device-info-parser.interface";
import type { IAccessTokenBlacklist } from "@auth-domain/ports/access-token-blacklist.interface";

// Use cases
import { LoginUseCase } from "@auth-application/use-cases/login.use-case";
import { RefreshTokenUseCase } from "@auth-application/use-cases/refresh-token.use-case";
import { LogoutUseCase } from "@auth-application/use-cases/logout.use-case";
import { LogoutAllDevicesUseCase } from "@auth-application/use-cases/logout-all-devices.use-case";
import { LogoutBySecurityEventUseCase } from "@auth-application/use-cases/logout-by-security-event.use-case";

// Infrastructure adapters
import { RedisSessionRepository } from "@auth-infrastructure/persistence/repositories/session.repository";
import { JwtTokenService } from "@auth-infrastructure/token/jwt-token.service";
import { CryptoTokenGenerator } from "@auth-infrastructure/token/crypto-token-generator";
import { RedisRateLimiter } from "@auth-infrastructure/rate-limiter/redis-rate-limiter";
import { UaParserDeviceInfoParser } from "@auth-infrastructure/device-info/ua-parser-device-info-parser";
import { RedisSessionBlacklist } from "@auth-infrastructure/blacklist/redis-session-blacklist";

// Controllers
import { LoginController } from "@auth-infrastructure/http/controllers/login.controller";
import { RefreshTokenController } from "@auth-infrastructure/http/controllers/refresh-token.controller";
import { LogoutController } from "@auth-infrastructure/http/controllers/logout.controller";
import { LogoutAllDevicesController } from "@auth-infrastructure/http/controllers/logout-all-devices.controller";

import { createAuthRoutes } from "@auth-infrastructure/http/routes/auth.routes";

import { TYPES } from "../types";
import { createAuthMiddleware } from "@auth-infrastructure/http/middlewares/auth.middleware";

export const authModule = new ContainerModule((options) => {
    const { bind } = options;

    // Ports / Adapters (infraestructura, singleton porque envuelven conexiones/clientes compartidos)
    bind<ISessionRepository>(TYPES.SessionRepository).to(RedisSessionRepository).inSingletonScope();
    bind<ITokenService>(TYPES.TokenService).to(JwtTokenService).inSingletonScope();
    bind<ITokenGenerator>(TYPES.TokenGenerator).to(CryptoTokenGenerator).inSingletonScope();
    bind<IRateLimiter>(TYPES.RateLimiter).to(RedisRateLimiter).inSingletonScope();
    bind<IDeviceInfoParser>(TYPES.DeviceInfoParser).to(UaParserDeviceInfoParser).inSingletonScope();
    bind<IAccessTokenBlacklist>(TYPES.AccessTokenBlacklist).to(RedisSessionBlacklist).inSingletonScope();

    // Use cases
    bind(TYPES.LoginUseCase).to(LoginUseCase).inTransientScope();
    bind(TYPES.RefreshTokenUseCase).to(RefreshTokenUseCase).inTransientScope();
    bind(TYPES.LogoutUseCase).to(LogoutUseCase).inTransientScope();
    bind(TYPES.LogoutAllDevicesUseCase).to(LogoutAllDevicesUseCase).inTransientScope();
    bind(TYPES.LogoutBySecurityEventUseCase).to(LogoutBySecurityEventUseCase).inTransientScope();

    // Controllers
    bind(TYPES.LoginController).to(LoginController).inTransientScope();
    bind(TYPES.RefreshTokenController).to(RefreshTokenController).inTransientScope();
    bind(TYPES.LogoutController).to(LogoutController).inTransientScope();
    bind(TYPES.LogoutAllDevicesController).to(LogoutAllDevicesController).inTransientScope();

    bind(TYPES.AuthMiddleware)
        .toDynamicValue((ctx) => createAuthMiddleware(
            ctx.get(TYPES.TokenService),
            ctx.get(TYPES.AccessTokenBlacklist)
        ));

    // Router
    bind(TYPES.AuthRouter)
        .toDynamicValue((ctx) =>
            createAuthRoutes({
                loginController: ctx.get(TYPES.LoginController),
                refreshTokenController: ctx.get(TYPES.RefreshTokenController),
                logoutController: ctx.get(TYPES.LogoutController),
                logoutAllDevicesController: ctx.get(TYPES.LogoutAllDevicesController),
                authMiddleware: ctx.get(TYPES.AuthMiddleware),
            })
        )
        .inSingletonScope();
});