import { Result } from "@shared-kernel/errors/result";
import { ValueObjectBase } from "@shared-domain/value-object.base";
import { RoleStatus } from "@users-domain/entities/role.entity";
import { InvalidRoleReferenceError } from "@users-domain/errors/invalid-role-reference.error";

interface RoleReferenceProps {
    id: string;
    name: string;
    level: number;
    status: RoleStatus;
}

/**
 * Value Object que representa una referencia a un Role
 * Contiene datos inmutables necesarios para reglas de negocio del User
 * NO es la entidad completa, es un snapshot de datos relevantes
 */
export class RoleReferenceVO extends ValueObjectBase {
    private readonly id: string;
    private readonly name: string;
    private readonly level: number;
    private readonly status: RoleStatus;

    private constructor(
        id: string,
        name: string,
        level: number,
        status: RoleStatus
    ) {
        super();
        this.id = id;
        this.name = name;
        this.level = level;
        this.status = status;
    }

    protected getEqualityComponents(): ReadonlyArray<unknown> {
        return [this.id]; // identidad lógica
    }

    public static create(props: RoleReferenceProps): Result<RoleReferenceVO, InvalidRoleReferenceError> {
        if (!props.id?.trim()) {
            return Result.fail(new InvalidRoleReferenceError('Role ID is required'));
        }

        if (!props.name?.trim()) {
            return Result.fail(new InvalidRoleReferenceError('Role name is required'));
        }

        if (props.level <= 0) {
            return Result.fail(new InvalidRoleReferenceError('Role level must be positive'));
        }

        return Result.ok(
            new RoleReferenceVO(
                props.id,
                props.name,
                props.level,
                props.status
            )
        );
    }

    // Getters para acceder a los datos
    public getId(): string { return this.id; }
    public getName(): string { return this.name; }
    public getLevel(): number { return this.level; }
    public getStatus(): RoleStatus { return this.status; }

    public isActive(): boolean {
        return this.status === RoleStatus.ACTIVE;
    }

    public isAssignable(): boolean {
        return this.isActive();
    }

    public canManageLevel(targetLevel: number): boolean {
        return this.level > targetLevel;
    }
}
