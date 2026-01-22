import bcrypt from "bcrypt";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

export class BCryptPasswordHasher implements IPasswordHasher {
    async hash(raw: string): Promise<string> {
        return bcrypt.hash(raw, 12);
    }

    async compare(raw: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(raw, hashed);
    }
}
