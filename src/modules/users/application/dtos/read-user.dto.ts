export interface ReadUserDto {
    id: string;
    name: string;
    lastName: string;
    email: string;
    dni: string;
    role: {
        id: string;
        name: string;
    }
    status: string;
    phone: string | null;
    address: string | null;
    photoUrl: string | null;
    createdAt: Date;
    updatedAt?: Date;
}
