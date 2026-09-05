export interface LoginResponseDto {
    accessToken: string;
    refreshToken: string;
    sessionId: string;
    expiresAt: Date;
    user: {
        id: string;
        email: string;
        role: string;
    };
}