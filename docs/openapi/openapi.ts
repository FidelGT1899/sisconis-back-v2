import type { OpenAPIV3 } from "openapi-types";
import { systemPaths } from "./paths/system.paths";
import { ErrorSchemas } from "./components/schemas/error.schema";
import { ErrorResponses } from "./components/responses/error.response";

export const openapi: OpenAPIV3.Document = {
    openapi: "3.0.3",
    info: {
        title: "SISCONIS API",
        version: "1.0.0",
        description: "REST API for managing institutional entry and exit permissions.",
        contact: {
            name: "Fidel García",
            email: "edwingarciatavara@gmail.com",
        },
        license: {
            name: "ISC",
        },
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Local Development",
        },
        {
            url: "https://api.sisconis.com",
            description: "Production",
        },
    ],
    tags: [
        { name: "Users", description: "User management operations" },
        { name: "Authentication", description: "Authentication and authorization" },
        { name: "Permissions", description: "Entry and exit permissions" },
    ],
    security: [
        {
            bearerAuth: []
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            ...ErrorSchemas,
        },
        responses: {
            ...ErrorResponses,
        },
        parameters: {},
    },
    paths: {
        ...systemPaths
    },
};
