import { EntityBase } from "@shared-domain/entity.base";
import type { BaseEntityProps } from "@shared-domain/entity.base";

export interface IRepository<TId extends string | number, 
T extends EntityBase<TId, BaseEntityProps<TId>>> {
    findById(id: TId): Promise<T | null>;
    findAll(): Promise<T[]>;
    save(entity: T): Promise<void>;
    update(entity: T): Promise<void>;
    delete(id: TId): Promise<void>;
}