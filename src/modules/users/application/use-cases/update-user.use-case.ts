import { injectable, inject } from "inversify";

import { TYPES } from "@shared-kernel/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";

import type { UpdateUserDto } from "@users-application/dtos/update-user.dto";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

export type UpdateUserResult = Result<UserEntity, AppError>

@injectable()
export class UpdateUserUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(dto: UpdateUserDto): Promise<UpdateUserResult> {
        const user = await this.userRepository.find(dto.id);

        if (!user) {
            return Result.fail(new UserNotFoundError(dto.id));
        }

        const updatedUserResult = UserEntity.fromExisting(user.getId(), {
            name: dto.name ?? user.getName(),
            lastName: dto.lastName ?? user.getLastName(),
            email: dto.email ?? user.getEmail(),
            password: dto.password ?? user.getPassword(),
        }, user.createdAt);

        if (updatedUserResult.isErr()) {
            return Result.fail(updatedUserResult.error());
        }

        const updatedUser = updatedUserResult.value();

        await this.userRepository.update(updatedUser);

        return Result.ok(updatedUser);
    }
}
