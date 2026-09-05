export const AuthPolicy = {
    ACCESS_TOKEN_TTL_SECONDS: 15 * 60,
    REFRESH_TOKEN_TTL_DAYS: 7,
    MAX_FAILED_ATTEMPTS_TIER1: 5,
    LOCKOUT_DURATION_TIER1_MINUTES: 15,
    MAX_FAILED_ATTEMPTS_TIER2: 10,
    LOCKOUT_DURATION_TIER2_MINUTES: 60,
    MAX_FAILED_ATTEMPTS_TIER3: 20,
    // Housekeeping: no determina bloqueo, solo evita que el contador
    // viva para siempre en Redis si el atacante abandona el intento.
    ATTEMPTS_HOUSEKEEPING_TTL_HOURS: 24,
} as const;