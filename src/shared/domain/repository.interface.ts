export interface IRepository<
    TId extends string,
    T extends { getId(): TId },
    TQParams = unknown,
    TResponse = T[]
> {
    findById(id: TId): Promise<T | null>;
    index(params?: TQParams): Promise<TResponse>;
    save(entity: T): Promise<T | void>;
    update(entity: T): Promise<T | void>;
    delete(id: TId): Promise<void>;
}
