import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
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
        const user = await this.userRepository.findById(dto.id);

        if (!user) {
            return Result.fail(new UserNotFoundError(dto.id));
        }

        user.updateProfile({ name: dto.name, lastName: dto.lastName });

        if (dto.email) {
            const res = user.updateEmail(dto.email);
            if (res.isErr()) return Result.fail(res.error());
        }

        await this.userRepository.update(user);

        return Result.ok(user);
    }
}
