import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-kernel/ioc/types";
import type { IIdGenerator } from "@shared-domain/ports/id-generator";

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
        @inject(TYPES.IdGenerator)
        private readonly idGenerator: IIdGenerator,
    ) { }

    async execute(dto: CreateUserDto): Promise<CreateUserResult> {
        const emailExists = await this.userRepository.existsByEmail(dto.email);

        if (emailExists) {
            return Result.fail(new UserAlreadyExistsError(dto.email));
        }

        const user = UserEntity.create(
            {
                name: dto.name,
                lastName: dto.lastName,
                email: dto.email,
                password: dto.password,
            },
            this.idGenerator,
        );

        if (user.isErr()) {
            return Result.fail(user.error());
        }

        await this.userRepository.save(user.value());

        return Result.ok(user.value());

    }
}
