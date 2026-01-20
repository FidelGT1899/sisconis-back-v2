import type { OpenAPIV3 } from "openapi-types";

export const systemPaths: OpenAPIV3.PathsObject = {
    "/v1/api/clock": {
        get: {
            tags: ["System"],
            summary: "Get system current time",
            responses: {
                200: {
                    description: "Current server time and timezone",
                },
            },
        },
    },

    "/v1/api/feature-flags": {
        get: {
            tags: ["System"],
            summary: "Get active feature flags",
            responses: {
                200: {
                    description: "List of available feature flags",
                },
            },
        },
    },

    "/v1/api/health": {
        get: {
            tags: ["System"],
            summary: "Health check",
            description: "Returns API health status",
            responses: {
                200: {
                    $ref: "#/components/responses/HealthOk",
                },
            },
        },
    },

    "/v1/api/readiness": {
        get: {
            tags: ["System"],
            summary: "Readiness check",
            responses: {
                200: {
                    description: "API is ready to accept traffic",
                },
                503: {
                    $ref: "#/components/responses/ServiceUnavailable",
                },
            },
        },
    },

    "/v1/api/system-info": {
        get: {
            tags: ["System"],
            summary: "Get system information",
            responses: {
                200: {
                    description: "System environment and version information",
                },
            },
        },
    },
};
