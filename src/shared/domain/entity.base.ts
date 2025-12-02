import type { IIdGenerator } from "@shared-domain/ports/id-generator";

export abstract class EntityBase<TId extends string | number = string> {
    protected readonly id: TId;
    public readonly createdAt: Date;
    public updatedAt: Date | undefined;
    public deletedAt: Date | undefined;
    public createdBy?: string;
    public updatedBy?: string;
    public deletedBy?: string;
    
    constructor(
        id?: TId,
        idGenerator?: IIdGenerator, 
        createdAt?: Date, 
        updatedAt?: Date
    ) {
        if (id) {
            this.id = id;
        } else if (idGenerator) {
            this.id = this.safeGeneratedId(idGenerator);
        } else {
            throw new Error("Entity requires an ID or an ID generator.");
        }
        
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt;
    }

    public getId(): TId {
        return this.id;
    }

    public equals(entity: EntityBase): boolean {
        if (!entity.id || !this.id) {
            return false;
        }

        if (!(entity instanceof EntityBase)) {
            return false;
        }
        
        return this.id === entity.id;
    }

    private safeGeneratedId(idGenerator: IIdGenerator): TId {
        const id = idGenerator.generate();
        if (typeof id === 'string' || typeof id === 'number') {
            return id as TId;
        }
        throw new Error('Invalid ID type generated');
    }
}