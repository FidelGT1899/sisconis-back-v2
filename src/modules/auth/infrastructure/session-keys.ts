export const sessionKey = (sessionId: string) => `session:${sessionId}`;
export const userSessionsKey = (userId: string) => `user_sessions:${userId}`;
export const blacklistKey = (sessionId: string) => `blacklist:${sessionId}`;