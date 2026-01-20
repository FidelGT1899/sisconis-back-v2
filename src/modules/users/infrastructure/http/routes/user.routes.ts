import { Router } from "express";

import { expressAdapter } from "@shared-infrastructure/http/adapters/express.adapter";

import type { CreateUserController } from "@users-infrastructure/http/controllers/create-user.controller";
import type { GetUsersController } from "@users-infrastructure/http/controllers/get-users.controller";
import type { GetUserController } from "@users-infrastructure/http/controllers/get-user.controller";
import type { UpdateUserController } from "@users-infrastructure/http/controllers/update-user.controller";
import type { DeleteUserController } from "@users-infrastructure/http/controllers/delete-user.controller";
import type { ChangeUserDniController } from "@users-infrastructure/http/controllers/change-user-dni.controller";
import type { ChangeUserPasswordController } from "@users-infrastructure/http/controllers/change-user-password.controller";
import type { ResetUserPasswordController } from "@users-infrastructure/http/controllers/reset-user-password.controller";

export function createUserRoutes(controllers: {
    getUserController: GetUserController,
    getUsersController: GetUsersController,
    createUserController: CreateUserController,
    updateUserController: UpdateUserController,
    deleteUserController: DeleteUserController,
    resetUserPasswordController: ResetUserPasswordController,
    changeUserPasswordController: ChangeUserPasswordController,
    changeUserDniController: ChangeUserDniController
}
): Router {
    const router = Router();

    router.get("/", expressAdapter(controllers.getUsersController));
    router.get("/:id", expressAdapter(controllers.getUserController));
    router.post("/", expressAdapter(controllers.createUserController));
    router.patch("/:id", expressAdapter(controllers.updateUserController));
    router.delete("/:id", expressAdapter(controllers.deleteUserController));
    router.patch("/:id/change-dni", expressAdapter(controllers.changeUserDniController));
    router.patch("/:id/change-password", expressAdapter(controllers.changeUserPasswordController));
    router.post("/:id/reset-password", expressAdapter(controllers.resetUserPasswordController));

    return router;
}
