import { z } from "zod";

export const RefreshTokenSchema = z.object({
    sessionId: z.uuid(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;