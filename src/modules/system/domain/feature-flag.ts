export class FeatureFlag {
    constructor(
        public readonly name: string,
        public readonly enabled: boolean,
        public readonly description?: string
    ) { }

    static create(name: string, enabled: boolean, description?: string): FeatureFlag {
        return new FeatureFlag(name, enabled, description);
    }

    static createAll(flags: Record<string, boolean>): FeatureFlag[] {
        return Object.entries(flags).map(([name, enabled]) =>
            new FeatureFlag(name, enabled)
        );
    }
}
