import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";
import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";

import { RoleEntity } from "@users-domain/entities/role.entity";
import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";

import { RoleAlreadyExistsError } from "@users-application/errors/role/role-already-exists.error";
import type { CreateRoleDto } from "@users-application/dtos/role/create-role.dto";
import { RoleLevelAlreadyExistsError } from "@users-application/errors/role/role-level-already-exists.error";

export type CreateRoleResult = Result<RoleEntity, AppError>;

@injectable()
export class CreateRoleUseCase {
    constructor(
        @inject(TYPES.RoleRepository)
        private readonly roleRepository: IRoleRepository,
        @inject(TYPES.EntityIdGenerator)
        private readonly idGenerator: IEntityIdGenerator,
    ) { }

    async execute(dto: CreateRoleDto): Promise<CreateRoleResult> {
        const existingRole = await this.roleRepository.existsByName(dto.name);
        if (existingRole) {
            return Result.fail(new RoleAlreadyExistsError("Role name already exists."));
        }

        const levelExists = await this.roleRepository.existsByLevel(dto.level);
        if (levelExists) {
            return Result.fail(new RoleLevelAlreadyExistsError(dto.level));
        }

        const role = RoleEntity.create({
            name: dto.name,
            description: dto.description,
            level: dto.level,
        }, this.idGenerator);

        if (role.isErr()) {
            return Result.fail(role.error());
        }

        await this.roleRepository.save(role.value());

        return Result.ok(role.value());
    }
}
