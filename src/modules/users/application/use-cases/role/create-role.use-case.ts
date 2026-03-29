import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";
import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";

import { RoleEntity } from "@users-domain/entities/role.entity";
import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";

import type { CreateRoleDto } from "@users-application/dtos/role/create-role.dto";
import type { ReadRoleDto } from "@users-application/dtos/role/read-role.dto";
import { RoleAlreadyExistsError } from "@users-application/errors/role/role-already-exists.error";
import { RoleLevelAlreadyExistsError } from "@users-application/errors/role/role-level-already-exists.error";
import { RoleResponseMapper } from "@users-application/mappers/role-response.mapper";

export type CreateRoleResult = Result<ReadRoleDto, AppError>;

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

        const roleResult = RoleEntity.create({
            name: dto.name,
            description: dto.description,
            level: dto.level,
        }, this.idGenerator);

        if (roleResult.isErr()) {
            return Result.fail(roleResult.error());
        }

        const role = roleResult.value();

        await this.roleRepository.save(role);

        return Result.ok(RoleResponseMapper.toDto(role));
    }
}
