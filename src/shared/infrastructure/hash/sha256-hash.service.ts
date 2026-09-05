import { createHash } from "node:crypto";
import { injectable } from "inversify";
import type { IHashService } from "@shared-domain/ports/hash-service";

@injectable()
export class Sha256HashService implements IHashService {
    hash(value: string): string {
        return createHash("sha256").update(value).digest("hex");
    }
}