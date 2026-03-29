export interface CreateRoleDto {
    name: string;
    description?: string | undefined;
    level: number;
}
