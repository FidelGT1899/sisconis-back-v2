import type { UserEntity } from "@users-domain/entities/user.entity";
import type { PaginationUsersDto } from "@users-application/dtos/pagination-users.dto";

export interface IUserRepository {
    existsByEmail(email: string): Promise<boolean>;
    index(params: PaginationUsersDto): Promise<UserEntity[]>;
    find(id: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<UserEntity>;
    update(user: UserEntity): Promise<UserEntity>;
    delete(id: string): Promise<void>;
}
