import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import { randomUUID } from "crypto";

export class UuidIdGenerator implements IIdGenerator {
    generate(): string {
        return randomUUID();
    }
}