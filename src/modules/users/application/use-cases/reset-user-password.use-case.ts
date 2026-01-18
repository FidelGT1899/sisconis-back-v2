import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

@injectable()
export class ResetUserPasswordUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<Result<void, AppError>> {
        const user = await this.userRepository.findById(userId);
        if (!user) return Result.fail(new UserNotFoundError(userId));

        user.resetToTemporaryPassword();

        await this.userRepository.update(user);
        return Result.ok(undefined);
    }
}
