import { Router } from "express";

import { expressAdapter } from "@shared-infrastructure/http/adapters/express.adapter";

import type { CreateUserController } from "@users-infrastructure/http/controllers/create-user.controller";
import type { GetUsersController } from "@users-infrastructure/http/controllers/get-users.controller";
import type { GetUserController } from "@users-infrastructure/http/controllers/get-user.controller";
import type { UpdateUserProfileController } from "@users-infrastructure/http/controllers/update-user-profile.controller";
import type { DeleteUserController } from "@users-infrastructure/http/controllers/delete-user.controller";
import type { ChangeUserDniController } from "@users-infrastructure/http/controllers/change-user-dni.controller";
import type { ChangeUserPasswordController } from "@users-infrastructure/http/controllers/change-user-password.controller";
import type { ResetUserPasswordController } from "@users-infrastructure/http/controllers/reset-user-password.controller";
import type { UpdateUserRoleController } from "@users-infrastructure/http/controllers/update-user-role.controller";
import type { UpdateUserByAdminController } from "@users-infrastructure/http/controllers/update-user-by-admin.controller";
import type { SuspendUserController } from "@users-infrastructure/http/controllers/suspend-user.controller";
import type { ActivateUserController } from "@users-infrastructure/http/controllers/activate-user.controller";
import type { DeactivateUserController } from "@users-infrastructure/http/controllers/deactivate-user.controller";

export function createUserRoutes(controllers: {
    getUserController: GetUserController,
    getUsersController: GetUsersController,
    createUserController: CreateUserController,
    updateUserProfileController: UpdateUserProfileController,
    updateUserByAdminController: UpdateUserByAdminController,
    deleteUserController: DeleteUserController,
    resetUserPasswordController: ResetUserPasswordController,
    changeUserPasswordController: ChangeUserPasswordController,
    changeUserDniController: ChangeUserDniController,
    updateUserRoleController: UpdateUserRoleController,
    suspendUserController: SuspendUserController,
    activateUserController: ActivateUserController,
    deactivateUserController: DeactivateUserController
}
): Router {
    const router = Router();

    router.get("/", expressAdapter(controllers.getUsersController));
    router.get("/:id", expressAdapter(controllers.getUserController));
    router.post("/", expressAdapter(controllers.createUserController));
    router.patch("/:id/update-profile", expressAdapter(controllers.updateUserProfileController));
    router.patch("/:id/update-by-admin", expressAdapter(controllers.updateUserByAdminController));
    router.delete("/:id", expressAdapter(controllers.deleteUserController));
    router.patch("/:id/change-dni", expressAdapter(controllers.changeUserDniController));
    router.patch("/:id/change-password", expressAdapter(controllers.changeUserPasswordController));
    router.post("/:id/reset-password", expressAdapter(controllers.resetUserPasswordController));
    router.post("/:id/update-user-role", expressAdapter(controllers.updateUserRoleController));
    router.post("/:id/suspend", expressAdapter(controllers.suspendUserController));
    router.post("/:id/activate", expressAdapter(controllers.activateUserController));
    router.post("/:id/deactivate", expressAdapter(controllers.deactivateUserController));

    return router;
}
