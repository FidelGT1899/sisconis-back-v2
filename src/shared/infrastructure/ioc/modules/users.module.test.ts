import { Container } from "inversify";
import type { Router } from "express";

import { usersModule } from "./users.module";
import { TYPES } from "../types";

describe('Users IoC module', () => {
    it('should resolve UsersHttpControllers without throwing', () => {
        const container = new Container();

        container.bind(TYPES.PrismaService).toConstantValue({
            getClient: jest.fn().mockReturnValue({
                user: {
                    count: jest.fn(),
                    findMany: jest.fn(),
                    findUnique: jest.fn(),
                    create: jest.fn(),
                    update: jest.fn(),
                },
                role: {
                    count: jest.fn(),
                    findMany: jest.fn(),
                    findUnique: jest.fn(),
                    create: jest.fn(),
                    update: jest.fn(),
                },
                $transaction: jest.fn(),
            }),
            isConnected: jest.fn().mockResolvedValue(true),
            disconnect: jest.fn().mockResolvedValue(undefined),
        });

        container.bind(TYPES.EntityIdGenerator).toConstantValue({
            generate: () => 'mock-uuid'
        });

        container.bind(TYPES.PasswordHasher).toConstantValue({
            hash: jest.fn().mockResolvedValue('hashed-password'),
            compare: jest.fn().mockResolvedValue(true)
        });

        container.bind(TYPES.RoleRepository).toConstantValue({
            findById: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            index: jest.fn(),
            existsByLevel: jest.fn(),
            existsByLevelExcluding: jest.fn(),
        });

        void container.load(usersModule);

        const usersRouter = container.get<Router>(TYPES.UsersRouter);

        expect(usersRouter).toBeDefined();
    });
});
