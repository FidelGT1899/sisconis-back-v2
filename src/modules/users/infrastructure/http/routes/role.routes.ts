import { Router } from "express";

import { expressAdapter } from "@shared-infrastructure/http/adapters/express.adapter";

import type { GetRolesController } from "@users-infrastructure/http/controllers/role/get-roles.controller";
import type { GetRoleController } from "@users-infrastructure/http/controllers/role/get-role.controller";
import type { UpdateRoleController } from "@users-infrastructure/http/controllers/role/update-role.controller";

export function createRoleRoutes(controllers: {
    getRoleController: GetRoleController,
    getRolesController: GetRolesController,
    updateRoleController: UpdateRoleController,
}
): Router {
    const router = Router();

    router.get("/", expressAdapter(controllers.getRolesController));
    router.get("/:id", expressAdapter(controllers.getRoleController));
    router.patch("/:id", expressAdapter(controllers.updateRoleController));

    return router;
}
