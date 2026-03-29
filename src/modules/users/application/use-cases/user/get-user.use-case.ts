import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import type { ReadUserDto } from "@users-application/dtos/read-user.dto";
import { UserResponseMapper } from "@users-application/mappers/user-response.mapper";

export type GetUserResult = Result<ReadUserDto, AppError>;

@injectable()
export class GetUserUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(id: string): Promise<GetUserResult> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            return Result.fail(new UserNotFoundError(id));
        }

        return Result.ok(UserResponseMapper.toDto(user));
    }
}
