import { FeatureFlag } from '@system-domain/feature-flag';

describe('FeatureFlag', () => {
    it('should create all flags preserving order and enabled state', () => {
        const flags = FeatureFlag.createAll({
            maintenanceMode: true,
            debugMode: false,
            apiDocs: true,
        });

        expect(flags).toHaveLength(3);
        expect(flags[0]).toEqual(new FeatureFlag('maintenanceMode', true));
        expect(flags[1]).toEqual(new FeatureFlag('debugMode', false));
        expect(flags[2]).toEqual(new FeatureFlag('apiDocs', true));
    });

    it('should create an empty list when no flags are provided', () => {
        const flags = FeatureFlag.createAll({});

        expect(flags).toHaveLength(0);
    });
});