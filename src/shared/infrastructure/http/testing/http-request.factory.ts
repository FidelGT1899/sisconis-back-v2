import type { HttpRequest } from '../ports/controller';

/**
 * Creates a mock HttpRequest, spreading any overrides on top of an empty object.
 * Fields not provided in overrides are simply absent (all HttpRequest fields are optional),
 * shielding controller tests from future HttpRequest signature changes.
 */
export const makeHttpRequest = <T = unknown>(
    overrides: Partial<HttpRequest<T>> = {}
): HttpRequest<T> => ({
    ...overrides,
});