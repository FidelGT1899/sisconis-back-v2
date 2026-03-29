import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import type { ChangeUserDniDto } from "@users-application/dtos/change-user-dni.dto";
import type { ReadUserDto } from "@users-application/dtos/read-user.dto";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { DniAlreadyInUseError } from "@users-application/errors/dni-already-in-use.error";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";

@injectable()
export class ChangeUserDniUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(dto: ChangeUserDniDto): Promise<Result<ReadUserDto, AppError>> {
        const user = await this.userRepository.findById(dto.id);

        if (!user) {
            return Result.fail(new UserNotFoundError(dto.id));
        }

        if (user.getDni() === dto.newDni) {
            return Result.ok(UserResponseMapper.toDto(user));
        }

        const dniInUse = await this.userRepository.existsByDniExcluding(dto.newDni, dto.id);
        if (dniInUse) {
            return Result.fail(new DniAlreadyInUseError(dto.newDni));
        }

        const result = user.updateDni(dto.newDni);
        if (result.isErr()) return Result.fail(result.error());

        await this.userRepository.update(user);

        return Result.ok(UserResponseMapper.toDto(user));
    }
}
