export class HttpResponseBuilder {
    static success<T>(data?: T, meta?: Record<string, unknown>, code?: string) {
        return {
            status: "success" as const,
            ...(code && { code }),
            data,
            ...(meta && { meta })
        };
    }

    static error(message: string, code?: string) {
        return {
            status: "error" as const,
            ...(code && { code }),
            message,
        };
    }
}
