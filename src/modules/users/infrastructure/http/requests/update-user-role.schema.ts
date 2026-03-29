import { z } from "zod";

export const UpdateUserRoleSchema = z.object({
    roleId: z.string().uuid(),
    executorId: z.string().uuid(),
});

export type UpdateUserRoleRequest = z.output<typeof UpdateUserRoleSchema>;
