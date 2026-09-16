import { Container } from "inversify";
import { Router } from "express";

import { authModule } from "@shared-infrastructure/ioc/modules/auth.module";
import { TYPES } from "@shared-infrastructure/ioc/types";

describe('Auth IoC module', () => {
    const buildContainer = (): Container => {
        const container = new Container();

        container.bind(TYPES.RedisService).toConstantValue({
            getClient: jest.fn().mockReturnValue({
                get: jest.fn(),
                set: jest.fn(),
                del: jest.fn(),
            }),
            isConnected: jest.fn().mockResolvedValue(true),
            disconnect: jest.fn().mockResolvedValue(undefined),
        });

        container.bind(TYPES.UserRepository).toConstantValue({
            findByEmail: jest.fn(),
            findById: jest.fn(),
            index: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            existsByEmail: jest.fn(),
            existsByDni: jest.fn(),
        });

        container.bind(TYPES.PasswordHasher).toConstantValue({
            hash: jest.fn().mockResolvedValue('hashed-password'),
            compare: jest.fn().mockResolvedValue(true),
        });

        container.bind(TYPES.HashService).toConstantValue({
            hash: jest.fn().mockReturnValue('hashed-value'),
        });

        container.bind(TYPES.EntityIdGenerator).toConstantValue({
            generate: () => 'mock-uuid',
        });

        void container.load(authModule);

        return container;
    };

    it('should resolve AuthRouter as an Express Router', () => {
        const container = buildContainer();

        const authRouter = container.get(TYPES.AuthRouter);

        expect(authRouter).toBeInstanceOf(Router);
    });

    it('should resolve every auth adapter, use case and controller binding', () => {
        const container = buildContainer();

        expect(container.get(TYPES.SessionRepository)).toBeDefined();
        expect(container.get(TYPES.TokenService)).toBeDefined();
        expect(container.get(TYPES.TokenGenerator)).toBeDefined();
        expect(container.get(TYPES.RateLimiter)).toBeDefined();
        expect(container.get(TYPES.DeviceInfoParser)).toBeDefined();
        expect(container.get(TYPES.AccessTokenBlacklist)).toBeDefined();

        expect(container.get(TYPES.LoginUseCase)).toBeDefined();
        expect(container.get(TYPES.RefreshTokenUseCase)).toBeDefined();
        expect(container.get(TYPES.LogoutUseCase)).toBeDefined();
        expect(container.get(TYPES.LogoutAllDevicesUseCase)).toBeDefined();
        expect(container.get(TYPES.LogoutBySecurityEventUseCase)).toBeDefined();

        expect(container.get(TYPES.LoginController)).toBeDefined();
        expect(container.get(TYPES.RefreshTokenController)).toBeDefined();
        expect(container.get(TYPES.LogoutController)).toBeDefined();
        expect(container.get(TYPES.LogoutAllDevicesController)).toBeDefined();
        expect(container.get(TYPES.AuthMiddleware)).toBeDefined();
    });
});