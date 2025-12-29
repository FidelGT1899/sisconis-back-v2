import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-kernel/ioc/types";

import type { UserEntity } from "@users-domain/entities/user.entity";
import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

export type GetUserResult = Result<UserEntity, AppError>;

@injectable()
export class GetUserUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(id: string): Promise<GetUserResult> {
        const user = await this.userRepository.find(id);

        if (!user) {
            return Result.fail(new UserNotFoundError(id));
        }

        return Result.ok(user);
    }
}
