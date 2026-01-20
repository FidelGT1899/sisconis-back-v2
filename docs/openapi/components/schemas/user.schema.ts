import type { OpenAPIV3 } from "openapi-types";

export const userSchemas: Record<string, OpenAPIV3.SchemaObject> = {
    User: {
        type: "object",
        required: ["id", "email", "name"],
        properties: {
            id: {
                type: "string",
                description: "User unique identifier (ULID)",
                example: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
            },
            email: {
                type: "string",
                format: "email",
                description: "User email address",
                example: "user@example.com",
            },
            name: {
                type: "string",
                description: "User full name",
                example: "John Doe",
            },
            role: {
                type: "string",
                enum: ["admin", "user", "guest"],
                description: "User role",
                example: "user",
            },
            createdAt: {
                type: "string",
                format: "date-time",
                description: "User creation timestamp",
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                description: "User last update timestamp",
            },
        },
    },
    CreateUserRequest: {
        type: "object",
        required: ["email", "name", "password"],
        properties: {
            email: {
                type: "string",
                format: "email",
                example: "user@example.com",
            },
            name: {
                type: "string",
                minLength: 2,
                maxLength: 100,
                example: "John Doe",
            },
            password: {
                type: "string",
                minLength: 8,
                example: "SecurePass123!",
            },
            role: {
                type: "string",
                enum: ["admin", "user", "guest"],
                default: "user",
            },
        },
    },
    UpdateUserRequest: {
        type: "object",
        properties: {
            name: {
                type: "string",
                minLength: 2,
                maxLength: 100,
            },
            email: {
                type: "string",
                format: "email",
            },
        },
    },
};
