import { Router } from "express";

import { expressAdapter } from "@shared-infrastructure/http/adapters/express.adapter";

import type { CreateUserController } from "@users-infrastructure/http/controllers/create-user.controller";
import type { GetUsersController } from "@users-infrastructure/http/controllers/get-users.controller";
import type { GetUserController } from "@users-infrastructure/http/controllers/get-user.controller";
import type { UpdateUserController } from "@users-infrastructure/http/controllers/update-user.controller";
import type { DeleteUserController } from "@users-infrastructure/http/controllers/delete-user.controller";

export function createUserRoutes(controllers: {
    getUserController: GetUserController,
    getUsersController: GetUsersController,
    createUserController: CreateUserController,
    updateUserController: UpdateUserController,
    deleteUserController: DeleteUserController
}
): Router {
    const router = Router();

    router.get("/", expressAdapter(controllers.getUsersController));
    router.get("/:id", expressAdapter(controllers.getUserController));
    router.post("/", expressAdapter(controllers.createUserController));
    router.put("/:id", expressAdapter(controllers.updateUserController));
    router.delete("/:id", expressAdapter(controllers.deleteUserController));

    return router;
}
