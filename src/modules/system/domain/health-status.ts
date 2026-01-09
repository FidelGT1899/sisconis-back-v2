export type HealthState = "ok" | "degraded";

export class HealthStatus {
    constructor(
        public readonly status: HealthState,
        public readonly timestamp: Date = new Date()
    ) { }

    public isHealthy(): boolean {
        return this.status === "ok";
    }

    static createOk(): HealthStatus {
        return new HealthStatus("ok");
    }
}
