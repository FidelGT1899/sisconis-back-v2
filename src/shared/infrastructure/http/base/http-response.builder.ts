export class HttpResponseBuilder {
    static success<T>(data?: T, code?: string) {
        return {
            status: "success" as const,
            ...(code && { code }),
            data,
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
