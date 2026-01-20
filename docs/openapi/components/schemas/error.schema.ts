import type { OpenAPIV3 } from "openapi-types";

export const ErrorSchemas: Record<string, OpenAPIV3.SchemaObject> = {
    Error: {
        type: "object",
        required: ["message", "code"],
        properties: {
            message: {
                type: "string",
                description: "Human-readable error message",
                example: "Resource not found",
            },
            code: {
                type: "string",
                description: "Machine-readable error code",
                example: "NOT_FOUND",
            },
            timestamp: {
                type: "string",
                format: "date-time",
                description: "Error occurrence timestamp",
            },
            path: {
                type: "string",
                description: "API path where error occurred",
                example: "/v1/api/users/123",
            },
            details: {
                type: "object",
                description: "Additional error context",
                additionalProperties: true,
            },
        },
    },
    ValidationError: {
        type: "object",
        required: ["message", "code", "errors"],
        properties: {
            message: {
                type: "string",
                example: "Validation failed",
            },
            code: {
                type: "string",
                example: "VALIDATION_ERROR",
            },
            errors: {
                type: "array",
                items: {
                    type: "object",
                    required: ["field", "message"],
                    properties: {
                        field: {
                            type: "string",
                            description: "Field that failed validation",
                            example: "email",
                        },
                        message: {
                            type: "string",
                            description: "Validation error message",
                            example: "Invalid email format",
                        },
                        code: {
                            type: "string",
                            description: "Validation error code",
                            example: "INVALID_FORMAT",
                        },
                    },
                },
            },
        },
    },
};
