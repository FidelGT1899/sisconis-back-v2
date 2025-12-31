import { ContainerModule } from "inversify";
import { TYPES } from "../types";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import { CreateUserUseCase } from "@users-application/use-cases/create-user.use-case";
import { GetUsersUseCase } from "@users-application/use-cases/get-users.use-case";
import { GetUserUseCase } from "@users-application/use-cases/get-user.use-case";
import { UpdateUserUseCase } from "@users-application/use-cases/update-user.use-case";
import { DeleteUserUseCase } from "@users-application/use-cases/delete-user.use-case";

import { UserRepository } from "@users-infrastructure/persistence/repositories/user.repository";
import { GetUsersController } from "@users-infrastructure/http/controllers/get-users.controller";
import { GetUserController } from "@users-infrastructure/http/controllers/get-user.controller";
import { CreateUserController } from "@users-infrastructure/http/controllers/create-user.controller";
import { UpdateUserController } from "@users-infrastructure/http/controllers/update-user.controller";
import { DeleteUserController } from "@users-infrastructure/http/controllers/delete-user.controller";

export interface UsersHttpControllers {
    createUserController: CreateUserController;
    getUserController: GetUserController;
    getUsersController: GetUsersController;
    updateUserController: UpdateUserController;
    deleteUserController: DeleteUserController;
}

export const usersModule = new ContainerModule((options) => {
    const { bind } = options;
    // Repositories
    bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();

    // Use cases
    bind(TYPES.CreateUserUseCase).to(CreateUserUseCase).inTransientScope();
    bind(TYPES.GetUsersUseCase).to(GetUsersUseCase).inTransientScope();
    bind(TYPES.GetUserUseCase).to(GetUserUseCase).inTransientScope();
    bind(TYPES.UpdateUserUseCase).to(UpdateUserUseCase).inTransientScope();
    bind(TYPES.DeleteUserUseCase).to(DeleteUserUseCase).inTransientScope();

    // Controllers
    bind(TYPES.CreateUserController).to(CreateUserController).inTransientScope();
    bind(TYPES.GetUsersController).to(GetUsersController).inTransientScope();
    bind(TYPES.GetUserController).to(GetUserController).inTransientScope();
    bind(TYPES.UpdateUserController).to(UpdateUserController).inTransientScope();
    bind(TYPES.DeleteUserController).to(DeleteUserController).inTransientScope();

    // Aggregate
    bind<UsersHttpControllers>(TYPES.UsersControllers)
        .toDynamicValue((ctx) => ({
            createUserController: ctx.get(TYPES.CreateUserController),
            getUserController: ctx.get(TYPES.GetUserController),
            getUsersController: ctx.get(TYPES.GetUsersController),
            updateUserController: ctx.get(TYPES.UpdateUserController),
            deleteUserController: ctx.get(TYPES.DeleteUserController),
        }))
        .inTransientScope();
});
