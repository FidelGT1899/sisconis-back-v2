import { ulid } from "ulid";
import type { IIdGenerator } from "@shared-domain/ports/id-generator";

/*
 * This class implements the IIdGenerator interface
 * and provides a method to generate a ULID 
 * ONLY for audit logs and metrics.
*/
export class UlidIdGenerator implements IIdGenerator {
    generate(): string {
        return ulid();
    }
}