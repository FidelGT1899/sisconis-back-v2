import { Result } from "@shared-kernel/errors/result";
import { DeviceInfoVO } from "@auth-domain/value-objects/device-info.vo";
import { SessionAlreadyRevokedError } from "@auth-domain/errors/session-already-revoked.error";
import { InvalidRefreshTokenHashError } from "@auth-domain/errors/invalid-refresh-token-hash.error";
import { InactiveSessionError } from "@auth-domain/errors/inactive-session.error";
import { InvalidSessionExpirationError } from "@auth-domain/errors/invalid-session-expiration.error";
import type { InvalidDeviceInfoError } from "@auth-domain/errors/invalid-device-info.error";

export enum SessionStatus {
    ACTIVE = 'ACTIVE',
    REVOKED = 'REVOKED',
    EXPIRED = 'EXPIRED',
}

export interface SessionPrimitives {
    sessionId: string;
    userId: string;
    deviceInfo: {
        deviceName: string;
        ip: string;
        userAgent: string;
    };
    refreshTokenHash: string;
    createdAt: Date;
    expiresAt: Date;
    revokedAt: Date | null;
}

export class SessionEntity {
    private constructor(
        private readonly sessionId: string,
        private readonly userId: string,
        private readonly deviceInfo: DeviceInfoVO,
        private refreshTokenHash: string,
        private readonly createdAt: Date,
        private expiresAt: Date,
        private revokedAt: Date | null,
    ) { }

    // --- Getters ---
    public getSessionId(): string { return this.sessionId; }
    public getUserId(): string { return this.userId; }
    public getDeviceInfo(): DeviceInfoVO { return this.deviceInfo; }
    public getCreatedAt(): Date { return this.createdAt; }
    public getExpiresAt(): Date { return this.expiresAt; }
    public getRevokedAt(): Date | null { return this.revokedAt; }

    // --- Factory: nueva sesión ---
    public static create(params: {
        sessionId: string;
        userId: string;
        deviceInfo: DeviceInfoVO;
        refreshTokenHash: string;
        createdAt: Date;
        expiresAt: Date;
    }): Result<SessionEntity, InvalidSessionExpirationError> {
        if (params.expiresAt <= params.createdAt) {
            return Result.fail(new InvalidSessionExpirationError('before-creation'));
        }

        return Result.ok(new SessionEntity(
            params.sessionId,
            params.userId,
            params.deviceInfo,
            params.refreshTokenHash,
            params.createdAt,
            params.expiresAt,
            null,
        ));
    }

    // --- Factory: reconstrucción desde Redis ---
    public static rehydrate(
        primitives: SessionPrimitives
    ): Result<SessionEntity, InvalidDeviceInfoError> {
        const deviceInfoResult = DeviceInfoVO.create(primitives.deviceInfo);

        if (deviceInfoResult.isErr()) {
            return Result.fail(deviceInfoResult.error());
        }

        return Result.ok(new SessionEntity(
            primitives.sessionId,
            primitives.userId,
            deviceInfoResult.value(),
            primitives.refreshTokenHash,
            primitives.createdAt,
            primitives.expiresAt,
            primitives.revokedAt,
        ));
    }

    // --- Behavior ---
    public revoke(at: Date = new Date()): Result<void, SessionAlreadyRevokedError> {
        if (this.isRevoked()) {
            return Result.fail(new SessionAlreadyRevokedError());
        }

        this.revokedAt = at;
        return Result.ok(undefined);
    }

    public rotateRefreshToken(
        newRefreshTokenHash: string
    ): Result<void, InvalidRefreshTokenHashError | InactiveSessionError> {
        if (!newRefreshTokenHash) {
            return Result.fail(new InvalidRefreshTokenHashError());
        }

        if (!this.isActive()) {
            return Result.fail(new InactiveSessionError());
        }

        this.refreshTokenHash = newRefreshTokenHash;
        return Result.ok(undefined);
    }

    public extendExpiration(
        newExpiresAt: Date
    ): Result<void, InvalidSessionExpirationError> {
        if (newExpiresAt <= new Date()) {
            return Result.fail(new InvalidSessionExpirationError('past'));
        }

        if (newExpiresAt <= this.createdAt) {
            return Result.fail(new InvalidSessionExpirationError('before-creation'));
        }

        this.expiresAt = newExpiresAt;
        return Result.ok(undefined);
    }

    // --- Queries ---
    public getStatus(at: Date = new Date()): SessionStatus {
        if (this.isRevoked()) return SessionStatus.REVOKED;
        if (this.isExpired(at)) return SessionStatus.EXPIRED;
        return SessionStatus.ACTIVE;
    }

    public isExpired(at: Date = new Date()): boolean {
        return this.expiresAt <= at;
    }

    public isRevoked(): boolean {
        return this.revokedAt !== null;
    }

    public isActive(at: Date = new Date()): boolean {
        return !this.isRevoked() && !this.isExpired(at);
    }

    public belongsTo(userId: string): boolean {
        return this.userId === userId;
    }

    public matchesRefreshTokenHash(hash: string): boolean {
        return this.refreshTokenHash === hash;
    }

    // --- Serialización ---
    public toPrimitives(): SessionPrimitives {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            deviceInfo: {
                deviceName: this.deviceInfo.getDeviceName(),
                ip: this.deviceInfo.getIp(),
                userAgent: this.deviceInfo.getUserAgent(),
            },
            refreshTokenHash: this.refreshTokenHash,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
            revokedAt: this.revokedAt,
        };
    }
}
