export class Clock {
    constructor(
        public readonly timestamp: Date,
        public readonly iso: string,
        public readonly unix: number
    ) { }

    static now(): Clock {
        const date = new Date();
        return new Clock(
            date,
            date.toISOString(),
            Math.floor(date.getTime() / 1000)
        );
    }
}
