import type { SessionEntity } from "@auth-domain/entities/session.entity";

export type SecurityEventReason =
    | 'DISABLED'
    | 'PASSWORD_CHANGED'
    | 'ROLE_CHANGED'
    | 'SUSPENDED';

export type RevocationReason =
    | SecurityEventReason
    | 'SUSPICIOUS'
    | 'USER_REQUESTED';

export interface ISessionRepository {
    save(session: SessionEntity): Promise<void>;
    findById(sessionId: string): Promise<SessionEntity | null>;
    findAllByUserId(userId: string): Promise<SessionEntity[]>;
    update(session: SessionEntity): Promise<void>;
    revokeAllByUserId(userId: string, reason: RevocationReason): Promise<void>;
}