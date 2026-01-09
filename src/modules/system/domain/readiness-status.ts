export type ReadinessState = "ready" | "not_ready";

export class ReadinessStatus {
    constructor(
        public readonly status: ReadinessState,
        public readonly checks: Record<string, boolean>,
        public readonly timestamp: Date = new Date()
    ) { }

    isReady(): boolean {
        return this.status === "ready";
    }

    static createReady(checks: Record<string, boolean> = {}): ReadinessStatus {
        const allChecksPass = Object.values(checks).every(check => check === true);
        const status: ReadinessState = allChecksPass ? "ready" : "not_ready";

        return new ReadinessStatus(status, checks);
    }

    static createNotReady(checks: Record<string, boolean>): ReadinessStatus {
        return new ReadinessStatus("not_ready", checks);
    }
}
