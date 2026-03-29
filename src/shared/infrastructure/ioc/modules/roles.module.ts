import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Repositories
import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";
import { RoleRepository } from "@users-infrastructure/persistence/repositories/role.repository";

// Use Cases
import { CreateRoleUseCase } from "@users-application/use-cases/role/create-role.use-case";
import { GetRolesUseCase } from "@users-application/use-cases/role/get-roles.use-case";
import { GetRoleUseCase } from "@users-application/use-cases/role/get-role.use-case";
import { UpdateRoleUseCase } from "@users-application/use-cases/role/update-role.use-case";
import { DeleteRoleUseCase } from "@users-application/use-cases/role/delete-role.use-case";
import { ActivateRoleUseCase } from "@users-application/use-cases/role/activate-role.use-case";
import { DeactivateRoleUseCase } from "@users-application/use-cases/role/deactivate-role.use-case";

// Controllers
import { CreateRoleController } from "@users-infrastructure/http/controllers/role/create-role.controller";
import { GetRolesController } from "@users-infrastructure/http/controllers/role/get-roles.controller";
import { GetRoleController } from "@users-infrastructure/http/controllers/role/get-role.controller";
import { UpdateRoleController } from "@users-infrastructure/http/controllers/role/update-role.controller";
import { DeleteRoleController } from "@users-infrastructure/http/controllers/role/delete-role.controller";
import { ActivateRoleController } from "@users-infrastructure/http/controllers/role/activate-role.controller";
import { DeactivateRoleController } from "@users-infrastructure/http/controllers/role/deactivate-role.controller";

export interface RolesHttpControllers {
    createRoleController: CreateRoleController;
    getRolesController: GetRolesController;
    getRoleController: GetRoleController;
    updateRoleController: UpdateRoleController;
    deleteRoleController: DeleteRoleController;
    activateRoleController: ActivateRoleController;
    deactivateRoleController: DeactivateRoleController;
}

export const rolesModule = new ContainerModule((options) => {
    const { bind } = options;

    // Repositories
    bind<IRoleRepository>(TYPES.RoleRepository).to(RoleRepository).inSingletonScope();

    // Use cases
    bind(TYPES.CreateRoleUseCase).to(CreateRoleUseCase).inTransientScope();
    bind(TYPES.GetRolesUseCase).to(GetRolesUseCase).inTransientScope();
    bind(TYPES.GetRoleUseCase).to(GetRoleUseCase).inTransientScope();
    bind(TYPES.UpdateRoleUseCase).to(UpdateRoleUseCase).inTransientScope();
    bind(TYPES.DeleteRoleUseCase).to(DeleteRoleUseCase).inTransientScope();
    bind(TYPES.ActivateRoleUseCase).to(ActivateRoleUseCase).inTransientScope();
    bind(TYPES.DeactivateRoleUseCase).to(DeactivateRoleUseCase).inTransientScope();

    // Controllers
    bind(TYPES.CreateRoleController).to(CreateRoleController).inTransientScope();
    bind(TYPES.GetRolesController).to(GetRolesController).inTransientScope();
    bind(TYPES.GetRoleController).to(GetRoleController).inTransientScope();
    bind(TYPES.UpdateRoleController).to(UpdateRoleController).inTransientScope();
    bind(TYPES.DeleteRoleController).to(DeleteRoleController).inTransientScope();
    bind(TYPES.ActivateRoleController).to(ActivateRoleController).inTransientScope();
    bind(TYPES.DeactivateRoleController).to(DeactivateRoleController).inTransientScope();

    // Aggregate
    bind<RolesHttpControllers>(TYPES.RolesControllers)
        .toDynamicValue((ctx) => ({
            createRoleController: ctx.get(TYPES.CreateRoleController),
            getRoleController: ctx.get(TYPES.GetRoleController),
            getRolesController: ctx.get(TYPES.GetRolesController),
            updateRoleController: ctx.get(TYPES.UpdateRoleController),
            deleteRoleController: ctx.get(TYPES.DeleteRoleController),
            activateRoleController: ctx.get(TYPES.ActivateRoleController),
            deactivateRoleController: ctx.get(TYPES.DeactivateRoleController),
        }))
        .inTransientScope();
});
