import { ContainerModule } from "inversify";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import { CreateUserUseCase } from "@users-application/use-cases/user/create-user.use-case";
import { GetUsersUseCase } from "@users-application/use-cases/user/get-users.use-case";
import { GetUserUseCase } from "@users-application/use-cases/user/get-user.use-case";
import { UpdateUserProfileUseCase } from "@users-application/use-cases/user/update-user-profile.use-case";
import { UpdateUserByAdminUseCase } from "@users-application/use-cases/user/update-user-by-admin.use-case";
import { DeleteUserUseCase } from "@users-application/use-cases/user/delete-user.use-case";
import { ResetUserPasswordUseCase } from "@users-application/use-cases/user/reset-user-password.use-case";
import { ChangeUserPasswordUseCase } from "@users-application/use-cases/user/change-user-password.use-case";
import { ChangeUserDniUseCase } from "@users-application/use-cases/user/change-user-dni.use-case";
import { UpdateUserRoleUseCase } from "@users-application/use-cases/user/update-user-role.use-case";
import { SuspendUserUseCase } from "@users-application/use-cases/user/suspend-user.use-case";
import { ActivateUserUseCase } from "@users-application/use-cases/user/activate-user.use-case";
import { DeactivateUserUseCase } from "@users-application/use-cases/user/deactivate-user.use-case";

import { UserRepository } from "@users-infrastructure/persistence/repositories/user.repository";
import { GetUsersController } from "@users-infrastructure/http/controllers/get-users.controller";
import { GetUserController } from "@users-infrastructure/http/controllers/get-user.controller";
import { CreateUserController } from "@users-infrastructure/http/controllers/create-user.controller";
import { UpdateUserProfileController } from "@users-infrastructure/http/controllers/update-user-profile.controller";
import { UpdateUserByAdminController } from "@users-infrastructure/http/controllers/update-user-by-admin.controller";
import { DeleteUserController } from "@users-infrastructure/http/controllers/delete-user.controller";
import { ResetUserPasswordController } from "@users-infrastructure/http/controllers/reset-user-password.controller";
import { ChangeUserPasswordController } from "@users-infrastructure/http/controllers/change-user-password.controller";
import { ChangeUserDniController } from "@users-infrastructure/http/controllers/change-user-dni.controller";
import { UpdateUserRoleController } from "@users-infrastructure/http/controllers/update-user-role.controller";
import { SuspendUserController } from "@users-infrastructure/http/controllers/suspend-user.controller";
import { ActivateUserController } from "@users-infrastructure/http/controllers/activate-user.controller";
import { DeactivateUserController } from "@users-infrastructure/http/controllers/deactivate-user.controller";

import { TYPES } from "../types";

export interface UsersHttpControllers {
    createUserController: CreateUserController;
    getUserController: GetUserController;
    getUsersController: GetUsersController;
    updateUserProfileController: UpdateUserProfileController;
    updateUserByAdminController: UpdateUserByAdminController;
    deleteUserController: DeleteUserController;
    resetUserPasswordController: ResetUserPasswordController;
    changeUserPasswordController: ChangeUserPasswordController;
    changeUserDniController: ChangeUserDniController;
    updateUserRoleController: UpdateUserRoleController;
    suspendUserController: SuspendUserController;
    activateUserController: ActivateUserController;
    deactivateUserController: DeactivateUserController;
}

export const usersModule = new ContainerModule((options) => {
    const { bind } = options;
    // Repositories
    bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();

    // Use cases
    bind(TYPES.CreateUserUseCase).to(CreateUserUseCase).inTransientScope();
    bind(TYPES.GetUsersUseCase).to(GetUsersUseCase).inTransientScope();
    bind(TYPES.GetUserUseCase).to(GetUserUseCase).inTransientScope();
    bind(TYPES.UpdateUserProfileUseCase).to(UpdateUserProfileUseCase).inTransientScope();
    bind(TYPES.UpdateUserByAdminUseCase).to(UpdateUserByAdminUseCase).inTransientScope();
    bind(TYPES.DeleteUserUseCase).to(DeleteUserUseCase).inTransientScope();
    bind(TYPES.ResetUserPasswordUseCase).to(ResetUserPasswordUseCase).inTransientScope();
    bind(TYPES.ChangeUserPasswordUseCase).to(ChangeUserPasswordUseCase).inTransientScope();
    bind(TYPES.ChangeUserDniUseCase).to(ChangeUserDniUseCase).inTransientScope();
    bind(TYPES.UpdateUserRoleUseCase).to(UpdateUserRoleUseCase).inTransientScope();
    bind(TYPES.SuspendUserUseCase).to(SuspendUserUseCase).inTransientScope();
    bind(TYPES.ActivateUserUseCase).to(ActivateUserUseCase).inTransientScope();
    bind(TYPES.DeactivateUserUseCase).to(DeactivateUserUseCase).inTransientScope();

    // Controllers
    bind(TYPES.CreateUserController).to(CreateUserController).inTransientScope();
    bind(TYPES.GetUsersController).to(GetUsersController).inTransientScope();
    bind(TYPES.GetUserController).to(GetUserController).inTransientScope();
    bind(TYPES.UpdateUserProfileController).to(UpdateUserProfileController).inTransientScope();
    bind(TYPES.UpdateUserByAdminController).to(UpdateUserByAdminController).inTransientScope();
    bind(TYPES.DeleteUserController).to(DeleteUserController).inTransientScope();
    bind(TYPES.ResetUserPasswordController).to(ResetUserPasswordController).inTransientScope();
    bind(TYPES.ChangeUserPasswordController).to(ChangeUserPasswordController).inTransientScope();
    bind(TYPES.ChangeUserDniController).to(ChangeUserDniController).inTransientScope();
    bind(TYPES.UpdateUserRoleController).to(UpdateUserRoleController).inTransientScope();
    bind(TYPES.SuspendUserController).to(SuspendUserController).inTransientScope();
    bind(TYPES.ActivateUserController).to(ActivateUserController).inTransientScope();
    bind(TYPES.DeactivateUserController).to(DeactivateUserController).inTransientScope();

    // Aggregate
    bind<UsersHttpControllers>(TYPES.UsersControllers)
        .toDynamicValue((ctx) => ({
            createUserController: ctx.get(TYPES.CreateUserController),
            getUserController: ctx.get(TYPES.GetUserController),
            getUsersController: ctx.get(TYPES.GetUsersController),
            updateUserProfileController: ctx.get(TYPES.UpdateUserProfileController),
            updateUserByAdminController: ctx.get(TYPES.UpdateUserByAdminController),
            deleteUserController: ctx.get(TYPES.DeleteUserController),
            resetUserPasswordController: ctx.get(TYPES.ResetUserPasswordController),
            changeUserPasswordController: ctx.get(TYPES.ChangeUserPasswordController),
            changeUserDniController: ctx.get(TYPES.ChangeUserDniController),
            updateUserRoleController: ctx.get(TYPES.UpdateUserRoleController),
            suspendUserController: ctx.get(TYPES.SuspendUserController),
            activateUserController: ctx.get(TYPES.ActivateUserController),
            deactivateUserController: ctx.get(TYPES.DeactivateUserController),
        }))
        .inTransientScope();
});
