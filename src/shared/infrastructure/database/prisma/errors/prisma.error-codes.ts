export const PrismaErrorCodes = {
    // Data Logic Errors
    UNIQUE_CONSTRAINT: "P2002",
    FOREIGN_KEY_CONSTRAINT: "P2003",
    NULL_CONSTRAINT: "P2011",
    RELATION_CONSTRAINT: "P2014",
    RECORD_NOT_FOUND: "P2025",

    // Infrastructure/Connection Errors
    CANNOT_REACH_DB: "P1001",
    CONNECTION_TIMEOUT: "P1008", // Connection timeout
    QUERY_TIMEOUT: "P2024",      // Query timeout
} as const;

export type PrismaErrorCode = typeof PrismaErrorCodes[keyof typeof PrismaErrorCodes];
