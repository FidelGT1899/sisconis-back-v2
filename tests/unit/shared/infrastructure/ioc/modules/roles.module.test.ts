import { Container } from "inversify";
import { Router } from "express";

import { rolesModule } from "@shared-infrastructure/ioc/modules/roles.module";
import { TYPES } from "@shared-infrastructure/ioc/types";

describe('Roles IoC module', () => {
    const buildContainer = (): Container => {
        const container = new Container();

        container.bind(TYPES.PrismaService).toConstantValue({
            getClient: jest.fn().mockReturnValue({
                role: {
                    count: jest.fn(),
                    findMany: jest.fn(),
                    findUnique: jest.fn(),
                    findFirst: jest.fn(),
                    create: jest.fn(),
                    update: jest.fn(),
                },
                $transaction: jest.fn(),
            }),
            isConnected: jest.fn().mockResolvedValue(true),
            disconnect: jest.fn().mockResolvedValue(undefined),
        });

        void container.load(rolesModule);

        return container;
    };

    it('should resolve RolesRouter as an Express Router', () => {
        const container = buildContainer();

        const rolesRouter = container.get(TYPES.RolesRouter);

        expect(rolesRouter).toBeInstanceOf(Router);
    });

    it('should resolve every roles repository, use case and controller binding', () => {
        const container = buildContainer();

        expect(container.get(TYPES.RoleRepository)).toBeDefined();

        expect(container.get(TYPES.GetRolesUseCase)).toBeDefined();
        expect(container.get(TYPES.GetRoleUseCase)).toBeDefined();
        expect(container.get(TYPES.UpdateRoleUseCase)).toBeDefined();

        expect(container.get(TYPES.GetRolesController)).toBeDefined();
        expect(container.get(TYPES.GetRoleController)).toBeDefined();
        expect(container.get(TYPES.UpdateRoleController)).toBeDefined();
    });
});