import type { OpenAPIV3 } from "openapi-types";

export const SystemSchemas: Record<string, OpenAPIV3.SchemaObject> = {
    HealthResponse: {
        type: "object",
        required: ["status", "uptime", "timestamp"],
        properties: {
            status: {
                type: "string",
                example: "ok",
            },
            uptime: {
                type: "number",
                example: 123456,
                description: "Uptime in seconds",
            },
            timestamp: {
                type: "string",
                format: "date-time",
                example: "2026-01-18T21:30:00Z",
            },
        },
    },
};
