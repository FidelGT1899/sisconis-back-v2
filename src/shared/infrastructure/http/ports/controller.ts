export interface SuccessResponse<T = unknown> {
    status: "success";
    data?: T;
    code?: string;
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
}

export interface HttpResponse<T = unknown> {
    statusCode: number;
    body?: SuccessResponse<T> | ErrorResponse;
}

export interface Controller<T = unknown> {
    handle(request: HttpRequest<T>): Promise<HttpResponse>;
}
