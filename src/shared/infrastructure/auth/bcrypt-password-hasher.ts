import bcrypt from "bcrypt";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

const SALT_ROUNDS = 12;

export class BCryptPasswordHasher implements IPasswordHasher {
    async hash(raw: string): Promise<string> {
        return bcrypt.hash(raw, SALT_ROUNDS);
    }

    async compare(raw: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(raw, hashed);
    }
}
