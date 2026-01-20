import type { OpenAPIV3 } from "openapi-types";

export const userPaths: OpenAPIV3.PathsObject = {
    "/v1/api/users": {
        get: {
            summary: "List all users",
            description: "Retrieve a paginated list of all users",
            tags: ["Users"],
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    in: "query",
                    name: "page",
                    schema: { type: "integer", minimum: 1, default: 1 },
                    description: "Page number",
                },
                {
                    in: "query",
                    name: "limit",
                    schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
                    description: "Items per page",
                },
            ],
            responses: {
                "200": {
                    description: "List of users retrieved successfully",
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    data: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/User" },
                                    },
                                    pagination: {
                                        type: "object",
                                        properties: {
                                            page: { type: "integer" },
                                            limit: { type: "integer" },
                                            total: { type: "integer" },
                                            totalPages: { type: "integer" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                "401": { $ref: "#/components/responses/Unauthorized" },
                "500": { $ref: "#/components/responses/InternalError" },
            },
        },
        post: {
            summary: "Create a new user",
            description: "Create a new user account",
            tags: ["Users"],
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/CreateUserRequest" },
                    },
                },
            },
            responses: {
                "201": {
                    description: "User created successfully",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/User" },
                        },
                    },
                },
                "400": { $ref: "#/components/responses/ValidationError" },
                "401": { $ref: "#/components/responses/Unauthorized" },
                "500": { $ref: "#/components/responses/InternalError" },
            },
        },
    },
    "/v1/api/users/{id}": {
        get: {
            summary: "Get user by ID",
            description: "Retrieve a specific user by their ID",
            tags: ["Users"],
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "string" },
                    description: "User ID (ULID)",
                    example: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
                },
            ],
            responses: {
                "200": {
                    description: "User found",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/User" },
                        },
                    },
                },
                "404": { $ref: "#/components/responses/NotFound" },
                "401": { $ref: "#/components/responses/Unauthorized" },
                "500": { $ref: "#/components/responses/InternalError" },
            },
        },
        patch: {
            summary: "Update user",
            description: "Update user information",
            tags: ["Users"],
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "string" },
                    description: "User ID",
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/UpdateUserRequest" },
                    },
                },
            },
            responses: {
                "200": {
                    description: "User updated successfully",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/User" },
                        },
                    },
                },
                "400": { $ref: "#/components/responses/ValidationError" },
                "404": { $ref: "#/components/responses/NotFound" },
                "401": { $ref: "#/components/responses/Unauthorized" },
                "500": { $ref: "#/components/responses/InternalError" },
            },
        },
        delete: {
            summary: "Delete user",
            description: "Permanently delete a user account",
            tags: ["Users"],
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "string" },
                    description: "User ID",
                },
            ],
            responses: {
                "204": {
                    description: "User deleted successfully",
                },
                "404": { $ref: "#/components/responses/NotFound" },
                "401": { $ref: "#/components/responses/Unauthorized" },
                "403": { $ref: "#/components/responses/Forbidden" },
                "500": { $ref: "#/components/responses/InternalError" },
            },
        },
    },
};
