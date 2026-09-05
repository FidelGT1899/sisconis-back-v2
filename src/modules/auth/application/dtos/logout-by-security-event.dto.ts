import type { SecurityEventReason } from "@auth-domain/repositories/session.repository.interface";

export interface LogoutBySecurityEventDto {
    userId: string;
    reason: SecurityEventReason;
}