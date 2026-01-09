import type { UserEntity } from "@users-domain/entities/user.entity";
import type { PaginationUsersDto } from "@users-application/dtos/pagination-users.dto";
import type { PaginatedResult } from "@shared-kernel/utils/paginated-result";
import type { ReadUserDto } from "@users-application/dtos/read-user.dto";

export interface IUserRepository {
    existsByEmail(email: string): Promise<boolean>;
    index(params: PaginationUsersDto): Promise<PaginatedResult<ReadUserDto>>;
    find(id: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<UserEntity>;
    update(user: UserEntity): Promise<UserEntity>;
    delete(id: string): Promise<void>;
}
