import { EntityBase } from "@shared-domain/entity.base";

export interface IRepository<T extends EntityBase<TId>, TId extends string | number> {
    findById(id: TId): Promise<T | null>;
    findAll(): Promise<T[]>;
    save(entity: T): Promise<void>;
    update(entity: T): Promise<void>;
    delete(id: TId): Promise<void>;
}