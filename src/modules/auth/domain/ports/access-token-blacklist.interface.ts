import type { RevocationReason } from "@auth-domain/repositories/session.repository.interface";

export interface IAccessTokenBlacklist {
    blacklist(sessionId: string, reason: RevocationReason): Promise<void>;
    isBlacklisted(sessionId: string): Promise<boolean>;
}