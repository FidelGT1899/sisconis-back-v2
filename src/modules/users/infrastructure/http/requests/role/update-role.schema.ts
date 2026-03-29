import { z } from "zod";

export const UpdateRoleSchema = z.object({
    name: z.string().min(3).max(50).trim().optional(),
    description: z.string().min(3).max(255).trim().optional(),
})
    .strict()
    .refine(
        data => Object.keys(data).length > 0,
        { message: "At least one field must be provided" }
    )
    .transform((data) => {
        return Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined)
        ) as { [K in keyof typeof data]: Exclude<(typeof data)[K], undefined> };
    });

export type UpdateRoleRequest = z.output<typeof UpdateRoleSchema>;
