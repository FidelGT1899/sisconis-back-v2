import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import { TYPES } from "@shared-kernel/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import type { PaginationParams } from "@shared-kernel/utils/pagination-params";

import type { IUserRepository, UserOrderBy } from "@users-domain/repositories/user.repository.interface";

import type { ReadUserDto } from "@users-application/dtos/read-user.dto";

export interface PaginatedUsers {
    items: ReadUserDto[];
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

    async execute(dto: PaginationParams<UserOrderBy>): Promise<GetUsersResult> {
        const pagination = {
            page: dto.page ?? 1,
            limit: dto.limit ?? 10,
            orderBy: dto.orderBy ?? 'createdAt',
            direction: dto.direction ?? 'desc',
            search: dto.search ?? ''
        };

        const { items, total } = await this.userRepository.index(pagination);

        const userDtos: ReadUserDto[] = items.map(user => ({
            id: user.getId(),
            name: user.getName(),
            lastName: user.getLastName(),
            email: user.getEmail(),
            createdAt: user.getCreatedAt()
        }));

        return Result.ok({
            items: userDtos,
            total,
            page: pagination.page,
            limit: pagination.limit
        });
    }
}
