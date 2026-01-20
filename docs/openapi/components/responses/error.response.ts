import type { OpenAPIV3 } from "openapi-types";

export const ErrorResponses: Record<string, OpenAPIV3.ResponseObject> = {
    BadRequest: {
        description: "Bad request - Invalid input",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error",
                },
                example: {
                    message: "Invalid request parameters",
                    code: "BAD_REQUEST",
                    timestamp: "2025-01-19T10:30:00Z",
                    path: "/v1/api/users",
                },
            },
        },
    },
    Unauthorized: {
        description: "Unauthorized - Authentication required",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error",
                },
                example: {
                    message: "Invalid or missing authentication token",
                    code: "UNAUTHORIZED",
                },
            },
        },
    },
    Forbidden: {
        description: "Forbidden - Insufficient permissions",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error",
                },
                example: {
                    message: "You don't have permission to access this resource",
                    code: "FORBIDDEN",
                },
            },
        },
    },
    NotFound: {
        description: "Resource not found",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error",
                },
                example: {
                    message: "User not found",
                    code: "NOT_FOUND",
                },
            },
        },
    },
    ValidationError: {
        description: "Validation error - Invalid input data",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/ValidationError",
                },
                example: {
                    message: "Validation failed",
                    code: "VALIDATION_ERROR",
                    errors: [
                        {
                            field: "email",
                            message: "Invalid email format",
                            code: "INVALID_FORMAT",
                        },
                        {
                            field: "password",
                            message: "Password must be at least 8 characters",
                            code: "MIN_LENGTH",
                        },
                    ],
                },
            },
        },
    },
    InternalError: {
        description: "Internal server error",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error",
                },
                example: {
                    message: "An unexpected error occurred",
                    code: "INTERNAL_ERROR",
                },
            },
        },
    },
    ServiceUnavailable: {
        description: "Service unavailable",
        content: {
            "application/json": {
                schema: {
                    $ref: "#/components/schemas/Error",
                },
                example: {
                    message: "Service temporarily unavailable",
                    code: "SERVICE_UNAVAILABLE",
                },
            },
        },
    },
};
