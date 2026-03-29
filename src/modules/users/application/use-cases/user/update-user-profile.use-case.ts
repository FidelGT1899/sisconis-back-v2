import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import type { UpdateUserProfileDto } from "@users-application/dtos/update-user-profile.dto";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import type { ReadUserDto } from "@users-application/dtos/read-user.dto";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";

export type UpdateUserProfileResult = Result<ReadUserDto, AppError>

@injectable()
export class UpdateUserProfileUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(dto: UpdateUserProfileDto): Promise<UpdateUserProfileResult> {
        const user = await this.userRepository.findById(dto.id);

        if (!user) {
            return Result.fail(new UserNotFoundError(dto.id));
        }

        user.updateProfile({
            ...(dto.name && { name: dto.name }),
            ...(dto.lastName && { lastName: dto.lastName }),
            ...(dto.phone && { phone: dto.phone }),
            ...(dto.address && { address: dto.address }),
            ...(dto.photoUrl && { photoUrl: dto.photoUrl }),
        });

        await this.userRepository.update(user);

        return Result.ok(UserResponseMapper.toDto(user));
    }
}
