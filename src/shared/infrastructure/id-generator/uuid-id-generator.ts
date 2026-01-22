import { randomUUID } from "crypto";
import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";

export class UuidIdGenerator implements IEntityIdGenerator {
    generate(): string {
        return randomUUID();
    }
}
