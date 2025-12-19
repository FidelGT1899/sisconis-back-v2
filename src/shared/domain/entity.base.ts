import type { IIdGenerator } from "@shared-domain/ports/id-generator";

export interface BaseEntityProps<TId> {
    id?: TId;
    idGenerator?: IIdGenerator;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    deletedBy?: string;
}

export abstract class EntityBase<TId extends string | number, Props extends BaseEntityProps<TId>> {
    protected readonly id: TId;
    public readonly createdAt: Date;
    public updatedAt: Date | undefined;
    public deletedAt: Date | undefined;
    public createdBy: string | undefined;
    public updatedBy: string | undefined;
    public deletedBy: string | undefined;
    
    constructor(props: Props) {
        if (props.id) {
            this.id = props.id;
        } else if (props.idGenerator) {
            this.id = this.safeGeneratedId(props.idGenerator);
        } else {
            throw new Error("Entity requires an ID or an ID generator.");
        }
        
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt;
        this.deletedAt = props.deletedAt;
        this.createdBy = props.createdBy;
        this.updatedBy = props.updatedBy;
        this.deletedBy = props.deletedBy;
    }

    public getId(): TId {
        return this.id;
    }

    public equals(entity: EntityBase<TId, Props>): boolean {
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