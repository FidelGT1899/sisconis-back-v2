import swaggerJsdoc, { type Options } from "swagger-jsdoc";
import type { OpenAPIV3 } from "openapi-types";

export function buildSwaggerSpec(
    options: Options
): OpenAPIV3.Document {
    return swaggerJsdoc(options) as unknown as OpenAPIV3.Document;
}
