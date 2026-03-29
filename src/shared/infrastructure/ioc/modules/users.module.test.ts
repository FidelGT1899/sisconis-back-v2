import { Container } from "inversify";
import { usersModule } from "./users.module";
import type { UsersHttpControllers } from "./users.module";
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

        const controllers = container.get<UsersHttpControllers>(TYPES.UsersControllers);

        expect(controllers).toBeDefined();
        expect(controllers.createUserController).toBeDefined();
        expect(controllers.getUserController).toBeDefined();
        expect(controllers.getUsersController).toBeDefined();
        expect(controllers.updateUserProfileController).toBeDefined();
        expect(controllers.updateUserByAdminController).toBeDefined();
        expect(controllers.deleteUserController).toBeDefined();
        expect(controllers.resetUserPasswordController).toBeDefined();
        expect(controllers.changeUserPasswordController).toBeDefined();
        expect(controllers.changeUserDniController).toBeDefined();
        expect(controllers.updateUserRoleController).toBeDefined();
        expect(controllers.suspendUserController).toBeDefined();
        expect(controllers.activateUserController).toBeDefined();
        expect(controllers.deactivateUserController).toBeDefined();
    });
});
