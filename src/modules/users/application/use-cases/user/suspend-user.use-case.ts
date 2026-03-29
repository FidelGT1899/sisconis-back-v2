import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import { UserNotFoundError } from "@users-application/errors/user-not-found.error";

@injectable()
export class SuspendUserUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly repository: IUserRepository
    ) { }

    async execute(id: string): Promise<Result<void, AppError>> {
        const user = await this.repository.findById(id);

        if (!user) {
            return Result.fail(new UserNotFoundError(id));
        }

        const canSuspend = user.ensureCanSuspend();
        if (canSuspend.isErr()) return Result.fail(canSuspend.error());

        user.suspend();

        await this.repository.update(user);

        return Result.ok(undefined);
    }
}
