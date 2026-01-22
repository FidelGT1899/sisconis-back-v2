import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";

export interface BaseEntityProps<TId> {
    id?: TId;
    idGenerator?: IEntityIdGenerator;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | undefined;
    createdBy?: string | undefined;
    updatedBy?: string | undefined;
    deletedBy?: string | undefined;
}

export abstract class EntityBase<TId extends string, Props extends BaseEntityProps<TId>> {
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

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt ?? this.createdAt;
    }

    // public getDeletedAt(): Date | undefined {
    //     return this.deletedAt;
    // }
    //
    // public getCreatedBy(): string | undefined {
    //     return this.createdBy;
    // }
    //
    // public getUpdatedBy(): string | undefined {
    //     return this.updatedBy;
    // }
    //
    // public getDeletedBy(): string | undefined {
    //     return this.deletedBy;
    // }

    public equals(entity: EntityBase<TId, Props>): boolean {
        if (!entity.id || !this.id) {
            return false;
        }

        if (!(entity instanceof EntityBase)) {
            return false;
        }

        return this.id === entity.id;
    }

    private safeGeneratedId(idGenerator: IEntityIdGenerator): TId {
        const id = idGenerator.generate();
        if (typeof id === 'string' || typeof id === 'number') {
            return id as TId;
        }
        throw new Error('Invalid ID type generated');
    }
}
