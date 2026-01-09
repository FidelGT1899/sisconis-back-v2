import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.config";
import type { Application } from "express";

export function setupSwagger(app: Application) {
    const SWAGGER_PATH = "/docs";
    if (process.env.NODE_ENV !== "production") {
        app.use(SWAGGER_PATH, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }
}

