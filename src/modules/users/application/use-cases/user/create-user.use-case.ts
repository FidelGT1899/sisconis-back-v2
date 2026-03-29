import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";
import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";

import type { CreateUserDto } from "@users-application/dtos/create-user.dto";
import type { ReadUserDto } from "@users-application/dtos/read-user.dto";
import { UserAlreadyExistsError } from "@users-application/errors/user-already-exists.error";
import { RoleNotFoundError } from "@users-application/errors/role/role-not-found.error";
import { RoleReferenceFactory } from "@users-application/factories/role-reference.factory";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";

export type CreateUserResult = Result<ReadUserDto, AppError>;

@injectable()
export class CreateUserUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository,
        @inject(TYPES.RoleRepository)
        private readonly roleRepository: IRoleRepository,
        @inject(TYPES.EntityIdGenerator)
        private readonly idGenerator: IEntityIdGenerator,
        @inject(TYPES.PasswordHasher)
        private readonly hasher: IPasswordHasher,
    ) { }

    async execute(dto: CreateUserDto): Promise<CreateUserResult> {
        const emailExists = await this.userRepository.existsByEmail(dto.email);
        if (emailExists) {
            return Result.fail(new UserAlreadyExistsError('email', dto.email));
        }

        const dniExists = await this.userRepository.existsByDni(dto.dni);
        if (dniExists) {
            return Result.fail(new UserAlreadyExistsError('dni', dto.dni));
        }

        const role = await this.roleRepository.findById(dto.roleId);
        if (!role) {
            return Result.fail(new RoleNotFoundError(dto.roleId));
        }

        const assignable = role.ensureAssignable();
        if (assignable.isErr()) return Result.fail(assignable.error());

        const roleRefResult = RoleReferenceFactory.fromRoleEntity(role);
        if (roleRefResult.isErr()) return Result.fail(roleRefResult.error());

        const userResult = await UserEntity.create(
            {
                name: dto.name,
                lastName: dto.lastName,
                email: dto.email,
                dni: dto.dni,
                role: roleRefResult.value(),
            },
            this.idGenerator,
            this.hasher
        );

        if (userResult.isErr()) {
            return Result.fail(userResult.error());
        }

        const user = userResult.value();

        await this.userRepository.save(user);

        return Result.ok(UserResponseMapper.toDto(user));
    }
}
