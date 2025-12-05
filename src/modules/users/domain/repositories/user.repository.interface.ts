import type { UserEntity } from "@modules/users/domain/entities/user.entity";

export interface IUserRepository {
    existsByEmail(email: string): Promise<boolean>;
    index(): Promise<UserEntity[]>;
    find(id: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<UserEntity>;
    update(user: UserEntity): Promise<UserEntity>;
    delete(id: string): Promise<void>;
}