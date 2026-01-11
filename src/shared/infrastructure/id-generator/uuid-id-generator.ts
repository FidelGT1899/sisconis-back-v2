import { randomUUID } from "crypto";
import type { IIdGenerator } from "@shared-domain/ports/id-generator";

export class UuidIdGenerator implements IIdGenerator {
    generate(): string {
        return randomUUID();
    }
}
