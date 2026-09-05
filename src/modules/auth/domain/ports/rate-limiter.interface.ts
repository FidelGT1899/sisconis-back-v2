export interface RateLimitStatus {
    isBlocked: boolean;
    remainingAttempts: number;
    retryAfterSeconds: number | null;
}

export interface IRateLimiter {
    checkLimit(identifier: string): Promise<RateLimitStatus>;
    recordFailedAttempt(identifier: string): Promise<void>;
    resetAttempts(identifier: string): Promise<void>;
}