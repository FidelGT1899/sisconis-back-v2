import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Repositories
import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";
import { RoleRepository } from "@users-infrastructure/persistence/repositories/role.repository";

// Use Cases
import { GetRolesUseCase } from "@users-application/use-cases/role/get-roles.use-case";
import { GetRoleUseCase } from "@users-application/use-cases/role/get-role.use-case";
import { UpdateRoleUseCase } from "@users-application/use-cases/role/update-role.use-case";

// Controllers
import { GetRolesController } from "@users-infrastructure/http/controllers/role/get-roles.controller";
import { GetRoleController } from "@users-infrastructure/http/controllers/role/get-role.controller";
import { UpdateRoleController } from "@users-infrastructure/http/controllers/role/update-role.controller";

import { createRoleRoutes } from "@users-infrastructure/http/routes/role.routes";

export const rolesModule = new ContainerModule((options) => {
    const { bind } = options;

    // Repositories
    bind<IRoleRepository>(TYPES.RoleRepository).to(RoleRepository).inSingletonScope();

    // Use cases
    bind(TYPES.GetRolesUseCase).to(GetRolesUseCase).inTransientScope();
    bind(TYPES.GetRoleUseCase).to(GetRoleUseCase).inTransientScope();
    bind(TYPES.UpdateRoleUseCase).to(UpdateRoleUseCase).inTransientScope();

    // Controllers
    bind(TYPES.GetRolesController).to(GetRolesController).inTransientScope();
    bind(TYPES.GetRoleController).to(GetRoleController).inTransientScope();
    bind(TYPES.UpdateRoleController).to(UpdateRoleController).inTransientScope();

    // Router
    bind(TYPES.RolesRouter)
        .toDynamicValue((ctx) =>
            createRoleRoutes({
                getRoleController: ctx.get(TYPES.GetRoleController),
                getRolesController: ctx.get(TYPES.GetRolesController),
                updateRoleController: ctx.get(TYPES.UpdateRoleController),
            })
        )
        .inSingletonScope();
});
