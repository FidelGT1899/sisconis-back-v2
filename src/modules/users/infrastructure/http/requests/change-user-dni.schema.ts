import { z } from "zod";

export const ChangeUserDniSchema = z.object({
    newDni: z.string().min(8).max(8).trim(),
})
