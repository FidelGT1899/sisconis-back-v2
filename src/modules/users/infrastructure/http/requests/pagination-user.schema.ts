import { z } from "zod";

export const PaginationUserSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    orderBy: z.enum(['createdAt', 'name']).default('createdAt'),
    direction: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().default('')
})
export type PaginationUserRequest = z.output<typeof PaginationUserSchema>
