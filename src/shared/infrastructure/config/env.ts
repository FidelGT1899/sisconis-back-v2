import { envSchema, type Env } from "@shared-infrastructure/config/env.schema";

function loadEnv(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const formatted = result.error.flatten().fieldErrors;
        console.error("Variables de entorno inválidas:", formatted);
        throw new Error("Variables de entorno inválidas. Revisar archivo .env");
    }

    return result.data;
}

export const env: Env = loadEnv();