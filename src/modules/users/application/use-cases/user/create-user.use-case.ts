import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";
import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

import { UserEntity } from "@users-domain/entities/user.entity";
import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import { UserAlreadyExistsError } from "@users-application/errors/user-already-exists.error";
import type { CreateUserDto } from "@users-application/dtos/create-user.dto";

export type CreateUserResult = Result<UserEntity, AppError>;

@injectable()
export class CreateUserUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository,
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

        const user = await UserEntity.create(
            {
                name: dto.name,
                lastName: dto.lastName,
                email: dto.email,
                dni: dto.dni,
            },
            this.idGenerator,
            this.hasher
        );

        if (user.isErr()) {
            return Result.fail(user.error());
        }

        await this.userRepository.save(user.value());

        return Result.ok(user.value());

    }
}
