import { Result } from "@shared-kernel/errors/result";
import { EntityBase, type BaseEntityProps } from "@shared-domain/entity.base";
import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";
import { InvalidRoleLevelError } from "@users-domain/errors/invalid-role-level.error";

export enum RoleStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

interface RoleProps extends BaseEntityProps<string> {
    name: string;
    description: string | null;
    status: RoleStatus;
    level: number;
}

export class RoleEntity extends EntityBase<string, RoleProps> {
    private props: RoleProps;

    private constructor(props: RoleProps) {
        super(props);
        this.props = props;
    }

    // --- Getters ---
    public getName(): string { return this.props.name; }
    public getDescription(): string | null { return this.props.description; }
    public getStatus(): RoleStatus { return this.props.status; }
    public getLevel(): number { return this.props.level; }

    // --- Factory Method from New Role ---
    public static create(
        payload: {
            name: string;
            description?: string | undefined;
            level: number;
        },
        idGenerator: IEntityIdGenerator
    ): Result<RoleEntity, InvalidRoleLevelError> {
        if (payload.level <= 0) {
            return Result.fail(new InvalidRoleLevelError(payload.level));
        }
        const id = idGenerator.generate();
        const role = new RoleEntity({
            id,
            name: payload.name,
            description: payload.description ?? null,
            level: payload.level,
            status: RoleStatus.PENDING,
            createdAt: new Date(),
        });
        return Result.ok(role);
    }

    // --- Factory Method from Existing Role(DB/Prisma) ---
    public static fromExisting(
        id: string,
        payload: {
            name: string;
            description: string | null;
            status: RoleStatus;
            level: number;
        },
        createdAt: Date
    ): Result<RoleEntity, InvalidRoleLevelError> {
        if (payload.level <= 0) {
            return Result.fail(new InvalidRoleLevelError(payload.level));
        }

        const role = new RoleEntity({
            id,
            ...payload,
            createdAt,
            updatedAt: new Date(),
        });

        return Result.ok(role);
    }

    public static rehydrate(props: RoleProps): RoleEntity {
        return new RoleEntity(props);
    }

    // --- Behavior Methods ---
    public deactivate(): void {
        this.props.status = RoleStatus.INACTIVE;
        this.updatedAt = new Date();
    }

    public activate(): void {
        this.props.status = RoleStatus.ACTIVE;
        this.updatedAt = new Date();
    }

    public updateDetails(name: string, description: string | null): void {
        this.props.name = name;
        this.props.description = description;
        this.updatedAt = new Date();
    }

    public updateHierarchy(level: number): Result<void, InvalidRoleLevelError> {
        if (level <= 0) {
            return Result.fail(new InvalidRoleLevelError(level));
        }
        this.props.level = level;
        this.updatedAt = new Date();
        return Result.ok(undefined);
    }
}
