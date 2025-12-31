import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-kernel/ioc/types";

import type { UserEntity } from "@users-domain/entities/user.entity";
import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import type { PaginationUsersDto } from "@users-application/dtos/pagination-users.dto";

export interface PaginatedUsers {
    items: UserEntity[];
    total: number;
    page: number;
    limit: number;
}

export type GetUsersResult = Result<PaginatedUsers, AppError>;

@injectable()
export class GetUsersUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(dto: PaginationUsersDto): Promise<GetUsersResult> {
        const pagination = {
            page: dto.page ?? 1,
            limit: dto.limit ?? 10,
            orderBy: dto.orderBy ?? 'createdAt',
            direction: dto.direction ?? 'desc',
            search: dto.search ?? ''
        };

        const { items, total } = await this.userRepository.index(pagination);

        return Result.ok({
            items,
            total,
            page: pagination.page,
            limit: pagination.limit
        });
    }
}
