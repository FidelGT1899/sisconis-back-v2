import { injectable, inject } from "inversify";

import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";
import { TYPES } from "@shared-infrastructure/ioc/types";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";

import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import type { ChangeUserPasswordDto } from "@users-application/dtos/change-user-password.dto";

@injectable()
export class ChangeUserPasswordUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository,
        @inject(TYPES.PasswordHasher)
        private readonly hasher: IPasswordHasher,
    ) { }

    async execute(dto: ChangeUserPasswordDto): Promise<Result<UserEntity, AppError>> {
        const user = await this.userRepository.findById(dto.id);

        if (!user) {
            return Result.fail(new UserNotFoundError(dto.id));
        }

        const result = await user.changePassword(dto.newPassword, this.hasher);

        if (result.isErr()) {
            return Result.fail(result.error());
        }

        const updatedUser = await this.userRepository.update(user);

        return Result.ok(updatedUser);
    }
}
