import { Result } from "@shared-kernel/errors/result";
import { EntityBase, type BaseEntityProps } from "@shared-domain/entity.base";
import { InvalidRoleLevelError } from "@users-domain/errors/invalid-role-level.error";

interface RoleProps extends BaseEntityProps<string> {
    name: string;
    description: string | null;
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
    public getLevel(): number { return this.props.level; }

    public static rehydrate(props: RoleProps): RoleEntity {
        return new RoleEntity(props);
    }

    // --- Behavior Methods ---
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
