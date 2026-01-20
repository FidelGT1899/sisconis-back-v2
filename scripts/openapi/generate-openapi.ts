import { writeFileSync } from "fs";
import { join } from "path";
import { openapi } from "../../docs/openapi/openapi";

const outputPath = join(process.cwd(), "docs", "openapi", "openapi.json");

writeFileSync(
    outputPath,
    JSON.stringify(openapi, null, 2),
    { encoding: "utf-8" }
);

console.log(`openapi.json generado en: ${outputPath}`);
