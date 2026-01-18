import { z } from "zod";

export const ChangeUserPasswordSchema = z.object({
    newPassword: z.string().min(8).max(50).regex(/^(?=.*[A-Za-z])(?=.*\d).+$/).trim(),
})
