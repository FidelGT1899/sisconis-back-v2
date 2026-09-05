import { z } from "zod";

export const UpdateUserProfileSchema = z.object({
    name: z.string().min(3).max(50).trim().optional(),
    lastName: z.string().min(3).max(50).trim().optional(),
    phone: z.string().min(3).max(20).trim().nullable().optional(),
    address: z.string().min(3).max(100).trim().nullable().optional(),
    photoUrl: z.string().regex(/^https:\/\/res\.cloudinary\.com\/.+/).nullable().optional(),
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

export type UpdateUserProfileRequest = z.output<typeof UpdateUserProfileSchema>;
