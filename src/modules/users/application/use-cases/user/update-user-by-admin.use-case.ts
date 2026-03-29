import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import type { UpdateUserByAdminDto } from "@users-application/dtos/update-user-by-admin.dto";
import type { ReadUserDto } from "@users-application/dtos/read-user.dto";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { EmailAlreadyInUseError } from "@users-application/errors/email-already-in-use.error";
import { DniAlreadyInUseError } from "@users-application/errors/dni-already-in-use.error";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";

export type UpdateUserByAdminResult = Result<ReadUserDto, AppError>

@injectable()
export class UpdateUserByAdminUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(dto: UpdateUserByAdminDto): Promise<UpdateUserByAdminResult> {
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

        if (dto.email) {
            const emailInUse = await this.userRepository.existsByEmailExcluding(dto.email, dto.id);
            if (emailInUse) return Result.fail(new EmailAlreadyInUseError(dto.email));

            const res = user.updateEmail(dto.email);
            if (res.isErr()) return Result.fail(res.error());
        }

        if (dto.dni) {
            const dniInUse = await this.userRepository.existsByDniExcluding(dto.dni, dto.id);
            if (dniInUse) return Result.fail(new DniAlreadyInUseError(dto.dni));

            const res = user.updateDni(dto.dni);
            if (res.isErr()) return Result.fail(res.error());
        }

        await this.userRepository.update(user);

        return Result.ok(UserResponseMapper.toDto(user));
    }
}
