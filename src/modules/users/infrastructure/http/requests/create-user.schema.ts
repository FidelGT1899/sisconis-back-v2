import { z } from "zod";

export const CreateUserSchema = z.object({
    name: z.string().min(3).max(50).trim(),
    lastName: z.string().min(3).max(50).trim(),
    email: z.email(),
    password: z.string().min(8).max(50).trim(),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>;