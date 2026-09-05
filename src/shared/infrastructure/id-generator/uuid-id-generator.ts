import { randomUUID } from "crypto";
import { injectable } from "inversify";
import type { IEntityIdGenerator } from "@shared-domain/ports/id-generator";

@injectable()
export class UuidIdGenerator implements IEntityIdGenerator {
    generate(): string {
        return randomUUID();
    }
}
