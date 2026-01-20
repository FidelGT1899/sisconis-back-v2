export const SystemResponses = {
    HealthOk: {
        description: "API is healthy",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/HealthResponse",
                },
                example: {
                    status: "ok",
                    uptime: 123456,
                    timestamp: "2026-01-18T21:30:00Z",
                },
            },
        },
    },
};
