import { Result } from "@shared-kernel/errors/result";
import { DeviceInfoVO } from "@auth-domain/value-objects/device-info.vo";
import { RefreshTokenHashVO } from "@auth-domain/value-objects/refresh-token-hash.vo";
import { SessionAlreadyRevokedError } from "@auth-domain/errors/session-already-revoked.error";
import { InvalidRefreshTokenHashError } from "@auth-domain/errors/invalid-refresh-token-hash.error";
import { InactiveSessionError } from "@auth-domain/errors/inactive-session.error";
import { InvalidSessionExpirationError } from "@auth-domain/errors/invalid-session-expiration.error";
import { InvalidDeviceInfoError } from "@auth-domain/errors/invalid-device-info.error";

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
    previousRefreshTokenHash: string | null;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    revokedAt: Date | null;
}

interface SessionProps {
    sessionId: string;
    userId: string;
    deviceInfo: DeviceInfoVO;
    refreshTokenHash: RefreshTokenHashVO;
    previousRefreshTokenHash: RefreshTokenHashVO | null;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    revokedAt: Date | null;
}

export class SessionEntity {
    private readonly props: SessionProps;

    private constructor(props: SessionProps) {
        this.props = props;
    }

    // --- Getters ---
    public getSessionId(): string { return this.props.sessionId; }
    public getUserId(): string { return this.props.userId; }
    public getDeviceInfo(): DeviceInfoVO { return this.props.deviceInfo; }
    public getCreatedAt(): Date { return this.props.createdAt; }
    public getUpdatedAt(): Date { return this.props.updatedAt; }
    public getExpiresAt(): Date { return this.props.expiresAt; }
    public getRevokedAt(): Date | null { return this.props.revokedAt; }

    // --- Factory: nueva sesión ---
    public static create(params: {
        sessionId: string;
        userId: string;
        deviceInfo: DeviceInfoVO;
        refreshTokenHash: RefreshTokenHashVO;
        createdAt: Date;
        expiresAt: Date;
    }): Result<SessionEntity, InvalidSessionExpirationError> {
        if (params.expiresAt <= params.createdAt) {
            return Result.fail(new InvalidSessionExpirationError('before-creation'));
        }

        return Result.ok(new SessionEntity({
            sessionId: params.sessionId,
            userId: params.userId,
            deviceInfo: params.deviceInfo,
            refreshTokenHash: params.refreshTokenHash,
            previousRefreshTokenHash: null,
            createdAt: params.createdAt,
            updatedAt: params.createdAt,
            expiresAt: params.expiresAt,
            revokedAt: null,
        }));
    }

    // --- Factory: reconstrucción desde Redis ---
    public static rehydrate(
        primitives: SessionPrimitives
    ): Result<SessionEntity, InvalidDeviceInfoError | InvalidRefreshTokenHashError> {
        const deviceInfoResult = DeviceInfoVO.create(primitives.deviceInfo);
        if (deviceInfoResult.isErr()) {
            return Result.fail(deviceInfoResult.error());
        }

        const refreshTokenHashResult = RefreshTokenHashVO.create(primitives.refreshTokenHash);
        if (refreshTokenHashResult.isErr()) {
            return Result.fail(refreshTokenHashResult.error());
        }

        let previousRefreshTokenHash: RefreshTokenHashVO | null = null;
        if (primitives.previousRefreshTokenHash !== null) {
            const previousResult = RefreshTokenHashVO.create(primitives.previousRefreshTokenHash);
            if (previousResult.isErr()) {
                return Result.fail(previousResult.error());
            }
            previousRefreshTokenHash = previousResult.value();
        }

        return Result.ok(new SessionEntity({
            sessionId: primitives.sessionId,
            userId: primitives.userId,
            deviceInfo: deviceInfoResult.value(),
            refreshTokenHash: refreshTokenHashResult.value(),
            previousRefreshTokenHash: previousRefreshTokenHash,
            createdAt: primitives.createdAt,
            updatedAt: primitives.updatedAt,
            expiresAt: primitives.expiresAt,
            revokedAt: primitives.revokedAt,
        }));
    }

    // --- Behavior ---
    public revoke(at: Date = new Date()): Result<void, SessionAlreadyRevokedError> {
        if (this.isRevoked()) {
            return Result.fail(new SessionAlreadyRevokedError());
        }

        this.props.revokedAt = at;
        this.props.updatedAt = at;
        return Result.ok(undefined);
    }

    public rotateRefreshToken(
        newRefreshTokenHash: RefreshTokenHashVO,
        at: Date = new Date()
    ): Result<void, InactiveSessionError> {
        if (!this.isActive()) {
            return Result.fail(new InactiveSessionError());
        }

        this.props.previousRefreshTokenHash = this.props.refreshTokenHash;
        this.props.refreshTokenHash = newRefreshTokenHash;
        this.props.updatedAt = at;

        return Result.ok(undefined);
    }

    public extendExpiration(
        newExpiresAt: Date,
        at: Date = new Date()
    ): Result<void, InvalidSessionExpirationError> {
        if (newExpiresAt <= at) {
            return Result.fail(new InvalidSessionExpirationError('past'));
        }

        if (newExpiresAt <= this.props.createdAt) {
            return Result.fail(new InvalidSessionExpirationError('before-creation'));
        }

        this.props.expiresAt = newExpiresAt;
        this.props.updatedAt = at;
        return Result.ok(undefined);
    }

    // --- Queries ---
    public getStatus(at: Date = new Date()): SessionStatus {
        if (this.isRevoked()) return SessionStatus.REVOKED;
        if (this.isExpired(at)) return SessionStatus.EXPIRED;
        return SessionStatus.ACTIVE;
    }

    public isExpired(at: Date = new Date()): boolean {
        return this.props.expiresAt <= at;
    }

    public isRevoked(): boolean {
        return this.props.revokedAt !== null;
    }

    public isActive(at: Date = new Date()): boolean {
        return !this.isRevoked() && !this.isExpired(at);
    }

    public belongsTo(userId: string): boolean {
        return this.props.userId === userId;
    }

    public matchesRefreshTokenHash(hash: RefreshTokenHashVO): boolean {
        return this.props.refreshTokenHash.equals(hash);
    }

    public matchesPreviousRefreshTokenHash(hash: RefreshTokenHashVO): boolean {
        return (
            this.props.previousRefreshTokenHash !== null &&
            this.props.previousRefreshTokenHash.equals(hash)
        );
    }

    // --- Serialización ---
    public toPrimitives(): SessionPrimitives {
        return {
            sessionId: this.props.sessionId,
            userId: this.props.userId,
            deviceInfo: {
                deviceName: this.props.deviceInfo.getDeviceName(),
                ip: this.props.deviceInfo.getIp(),
                userAgent: this.props.deviceInfo.getUserAgent(),
            },
            refreshTokenHash: this.props.refreshTokenHash.getValue(),
            previousRefreshTokenHash: this.props.previousRefreshTokenHash?.getValue() || null,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt,
            expiresAt: this.props.expiresAt,
            revokedAt: this.props.revokedAt,
        };
    }
}
