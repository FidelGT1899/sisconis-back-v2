import { z } from "zod";

export const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL es requerido'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
    REDIS_URL: z.string().min(1, 'REDIS_URL es requerido'),
    TRUST_PROXY: z.enum(["true", "false"]).default("false"),
});

export type Env = z.infer<typeof envSchema>;