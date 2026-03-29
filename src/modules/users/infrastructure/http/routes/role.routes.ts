import { Router } from "express";

import { expressAdapter } from "@shared-infrastructure/http/adapters/express.adapter";

import type { CreateRoleController } from "@users-infrastructure/http/controllers/role/create-role.controller";
import type { GetRolesController } from "@users-infrastructure/http/controllers/role/get-roles.controller";
import type { GetRoleController } from "@users-infrastructure/http/controllers/role/get-role.controller";
import type { UpdateRoleController } from "@users-infrastructure/http/controllers/role/update-role.controller";
import type { DeleteRoleController } from "@users-infrastructure/http/controllers/role/delete-role.controller";
import type { ActivateRoleController } from "@users-infrastructure/http/controllers/role/activate-role.controller";
import type { DeactivateRoleController } from "@users-infrastructure/http/controllers/role/deactivate-role.controller";

export function createRoleRoutes(controllers: {
    getRoleController: GetRoleController,
    getRolesController: GetRolesController,
    createRoleController: CreateRoleController,
    updateRoleController: UpdateRoleController,
    deleteRoleController: DeleteRoleController,
    activateRoleController: ActivateRoleController,
    deactivateRoleController: DeactivateRoleController
}
): Router {
    const router = Router();

    router.get("/", expressAdapter(controllers.getRolesController));
    router.get("/:id", expressAdapter(controllers.getRoleController));
    router.post("/", expressAdapter(controllers.createRoleController));
    router.patch("/:id", expressAdapter(controllers.updateRoleController));
    router.delete("/:id", expressAdapter(controllers.deleteRoleController));
    router.post("/:id/activate", expressAdapter(controllers.activateRoleController));
    router.post("/:id/deactivate", expressAdapter(controllers.deactivateRoleController));

    return router;
}
