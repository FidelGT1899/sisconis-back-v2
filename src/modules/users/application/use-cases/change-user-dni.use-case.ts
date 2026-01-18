import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";

import type { ChangeUserDniDto } from "@users-application/dtos/change-user-dni.dto";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { UserAlreadyExistsError } from "@users-application/errors/user-already-exists.error";

@injectable()
export class ChangeUserDniUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(dto: ChangeUserDniDto): Promise<Result<UserEntity, AppError>> {
        const user = await this.userRepository.findById(dto.id);

        if (!user) {
            return Result.fail(new UserNotFoundError(dto.id));
        }

        const dniExists = await this.userRepository.existsByDni(dto.newDni);
        if (dniExists) {
            return Result.fail(new UserAlreadyExistsError('dni', dto.newDni));
        }

        const result = user.updateDni(dto.newDni);

        if (result.isErr()) {
            return Result.fail(result.error());
        }

        const updatedUser = await this.userRepository.update(user);

        return Result.ok(updatedUser);
    }
}
