import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

export type DeleteUserResult = Result<void, AppError>;

@injectable()
export class DeleteUserUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(id: string): Promise<DeleteUserResult> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            return Result.fail(new UserNotFoundError(id));
        }

        await this.userRepository.delete(id);

        return Result.ok(undefined);
    }
}
