import { FeatureFlagsUseCase } from '@system-application/use-cases/feature-flags.use-case';
import { FeatureFlag } from '@system-domain/feature-flag';

describe('FeatureFlagsUseCase', () => {
    const originalVars: Record<string, string | undefined> = {};

    beforeAll(() => {
        originalVars.FEATURE_MAINTENANCE_MODE = process.env.FEATURE_MAINTENANCE_MODE;
        originalVars.FEATURE_DEBUG_MODE = process.env.FEATURE_DEBUG_MODE;
        originalVars.FEATURE_API_DOCS = process.env.FEATURE_API_DOCS;
    });

    afterEach(() => {
        delete process.env.FEATURE_MAINTENANCE_MODE;
        delete process.env.FEATURE_DEBUG_MODE;
        delete process.env.FEATURE_API_DOCS;
    });

    afterAll(() => {
        if (originalVars.FEATURE_MAINTENANCE_MODE !== undefined) {
            process.env.FEATURE_MAINTENANCE_MODE = originalVars.FEATURE_MAINTENANCE_MODE;
        }
        if (originalVars.FEATURE_DEBUG_MODE !== undefined) {
            process.env.FEATURE_DEBUG_MODE = originalVars.FEATURE_DEBUG_MODE;
        }
        if (originalVars.FEATURE_API_DOCS !== undefined) {
            process.env.FEATURE_API_DOCS = originalVars.FEATURE_API_DOCS;
        }
    });

    it('should mark flags enabled when env vars are literal "true"', async () => {
        process.env.FEATURE_MAINTENANCE_MODE = 'true';
        process.env.FEATURE_DEBUG_MODE = 'true';
        process.env.FEATURE_API_DOCS = 'true';
        const useCase = new FeatureFlagsUseCase();

        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        const flags = result.value();
        const byName = new Map(flags.map(flag => [flag.name, flag.enabled]));
        expect(byName.get('maintenanceMode')).toBe(true);
        expect(byName.get('debugMode')).toBe(true);
        expect(byName.get('apiDocs')).toBe(true);
    });

    it('should mark flags disabled when env vars are absent', async () => {
        const useCase = new FeatureFlagsUseCase();

        const result = await useCase.execute();

        const flags = result.value();
        const byName = new Map(flags.map(flag => [flag.name, flag.enabled]));
        expect(byName.get('maintenanceMode')).toBe(false);
        expect(byName.get('debugMode')).toBe(false);
        expect(byName.get('apiDocs')).toBe(false);
    });

    it('should mark flags disabled for any value other than literal "true"', async () => {
        process.env.FEATURE_MAINTENANCE_MODE = '1';
        process.env.FEATURE_DEBUG_MODE = 'TRUE';
        process.env.FEATURE_API_DOCS = 'enabled';
        const useCase = new FeatureFlagsUseCase();

        const result = await useCase.execute();

        const flags = result.value();
        const byName = new Map(flags.map(flag => [flag.name, flag.enabled]));
        expect(byName.get('maintenanceMode')).toBe(false);
        expect(byName.get('debugMode')).toBe(false);
        expect(byName.get('apiDocs')).toBe(false);
        flags.forEach(flag => expect(flag).toBeInstanceOf(FeatureFlag));
    });
});