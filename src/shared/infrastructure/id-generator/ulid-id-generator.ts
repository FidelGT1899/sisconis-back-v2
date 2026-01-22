import { ulid } from "ulid";
import type { IAuditIdGenerator } from "@shared-domain/ports/id-generator";

/*
 * This class implements the IAuditIdGenerator interface
 * and provides a method to generate a ULID
 * ONLY for audit logs and metrics.
*/
export class UlidIdGenerator implements IAuditIdGenerator {
    generate(): string {
        return ulid();
    }
}
