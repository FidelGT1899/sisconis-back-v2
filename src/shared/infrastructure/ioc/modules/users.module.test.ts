import { Container } from "inversify";
import { usersModule, UsersHttpControllers } from "./users.module";
import { TYPES } from "../types";

describe('Users IoC module', () => {
    it('should resolve UsersHttpControllers without throwing', () => {
        const container = new Container();

        const mockPrismaService = {
            getClient: jest.fn().mockReturnValue({
                user: {
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
        };
        container.bind(TYPES.PrismaService).toConstantValue(mockPrismaService);

        const mockIdGenerator = {
            generate: () => 'mock-uuid'
        };
        container.bind(TYPES.IdGenerator).toConstantValue(mockIdGenerator);

        void container.load(usersModule);

        const controllers = container.get<UsersHttpControllers>(TYPES.UsersControllers);

        expect(controllers).toBeDefined();
        expect(controllers.getUsersController).toBeDefined();
        expect(controllers.getUserController).toBeDefined();
        expect(controllers.createUserController).toBeDefined();
        expect(controllers.updateUserController).toBeDefined();
        expect(controllers.deleteUserController).toBeDefined();
    });
});
