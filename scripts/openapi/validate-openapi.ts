import SwaggerParser from "@apidevtools/swagger-parser";
import { openapi } from "../../docs/openapi/openapi";

async function validate() {
    await SwaggerParser.validate(openapi);
    console.log("✅ OpenAPI spec is valid");
}

validate().catch(err => {
    console.error("❌ OpenAPI spec is invalid");
    console.error(err);
    process.exit(1);
});
