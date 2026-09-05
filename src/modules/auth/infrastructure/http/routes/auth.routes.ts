import { Router, type RequestHandler } from "express";

import { expressAdapter } from "@shared-infrastructure/http/adapters/express.adapter";

import type { LoginController } from "@auth-infrastructure/http/controllers/login.controller";
import type { RefreshTokenController } from "@auth-infrastructure/http/controllers/refresh-token.controller";
import type { LogoutController } from "@auth-infrastructure/http/controllers/logout.controller";
import type { LogoutAllDevicesController } from "@auth-infrastructure/http/controllers/logout-all-devices.controller";

export function createAuthRoutes(dependencies: {
    loginController: LoginController;
    refreshTokenController: RefreshTokenController;
    logoutController: LogoutController;
    logoutAllDevicesController: LogoutAllDevicesController;
    authMiddleware: RequestHandler;
}): Router {
    const router = Router();

    // Rutas públicas — no requieren access token, son el punto de entrada/renovación
    router.post("/login", expressAdapter(dependencies.loginController));
    router.post("/refresh", expressAdapter(dependencies.refreshTokenController));

    // Middleware para rutas protegidas
    router.use(dependencies.authMiddleware);

    // Rutas protegidas — requieren sesión activa (req.auth poblado por authMiddleware)
    router.post("/logout", expressAdapter(dependencies.logoutController));
    router.post("/logout-all", expressAdapter(dependencies.logoutAllDevicesController));

    return router;
}