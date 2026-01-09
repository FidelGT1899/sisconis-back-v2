export class SystemInfo {
    constructor(
        public readonly name: string,
        public readonly version: string,
        public readonly environment: string,
        public readonly uptime: number
    ) { }

    static createFromEnv(): SystemInfo {
        return new SystemInfo(
            "sisconis-api",
            process.env.APP_VERSION ?? "dev",
            process.env.NODE_ENV ?? "local",
            process.uptime()
        );
    }
}
