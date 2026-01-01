import { Container } from "inversify";
import { usersModule, UsersHttpControllers } from "./users.module";
import { TYPES } from "../types";

describe('Users IoC module', () => {
    it('should resolve UsersHttpControllers without throwing', () => {
        const container = new Container();

        container.bind(TYPES.PrismaClient).toConstantValue({});

        const mockIdGenerator = {
            generate: () => 'mock-uuid'
        };
        container.bind(TYPES.IdGenerator).toConstantValue(mockIdGenerator);

        void container.load(usersModule);

        const controllers =
            container.get<UsersHttpControllers>(TYPES.UsersControllers);

        expect(controllers).toBeDefined();
        expect(controllers.getUsersController).toBeDefined();
    });
});


