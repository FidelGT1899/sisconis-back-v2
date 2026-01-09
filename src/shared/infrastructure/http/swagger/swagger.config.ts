import type { Options } from "swagger-jsdoc";
import { buildSwaggerSpec } from "./swagger.provider";

const options: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SISCONIS API",
            version: "1.0.0",
            description:
                "REST API for managing institutional entry and exit permissions.",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local server",
            },
        ],
    },
    apis: ["src/**/*.controller.ts", "src/**/*.routes.ts"],
};

export const swaggerSpec = buildSwaggerSpec(options);
