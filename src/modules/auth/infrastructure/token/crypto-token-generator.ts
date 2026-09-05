import { randomBytes } from "node:crypto";
import { injectable } from "inversify";

import type { ITokenGenerator } from "@auth-domain/ports/token-generator.interface";

const TOKEN_BYTES_LENGTH = 64;

@injectable()
export class CryptoTokenGenerator implements ITokenGenerator {
    public generate(): string {
        return randomBytes(TOKEN_BYTES_LENGTH).toString('hex');
    }
}