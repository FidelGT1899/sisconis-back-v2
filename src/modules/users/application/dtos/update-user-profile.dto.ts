export interface UpdateUserProfileDto {
    id: string;
    name?: string;
    lastName?: string;
    phone?: string | null;
    address?: string | null;
    photoUrl?: string | null;
}
