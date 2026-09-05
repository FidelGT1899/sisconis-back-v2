export interface SuccessResponse<T = unknown> {
    status: "success";
    data?: T;
    code?: string;
    meta?: Record<string, unknown>;
}

export interface ErrorResponse {
    status: "error";
    message: string;
    code?: string;
    details?: Record<string, unknown>;
}

export interface HttpRequest<T = unknown> {
    body?: T;
    params?: Record<string, string>;
    query?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    ip?: string;
    cookies?: Record<string, string>;
    auth?: {
        userId: string;
        email: string;
        role: string;
        sessionId: string;
    };
}

export interface HttpCookie {
    name: string;
    value: string;
    options?: {
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "strict" | "lax" | "none";
        maxAge?: number; // ms
        path?: string;
    };
}

export interface HttpResponse<T = unknown> {
    statusCode: number;
    body?: SuccessResponse<T> | ErrorResponse;
    cookies?: HttpCookie[];
}

export interface Controller<T = unknown> {
    handle(request: HttpRequest<T>): Promise<HttpResponse>;
}