export interface ReadRoleDto {
    id: string;
    name: string;
    description?: string;
    level: number;
    createdAt: Date;
    updatedAt?: Date;
}
