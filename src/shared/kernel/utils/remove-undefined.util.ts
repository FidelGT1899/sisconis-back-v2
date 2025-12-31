export function removeUndefined<T extends object>(obj: T) {
    type NonUndefined<U> = {
        [K in keyof U]: Exclude<U[K], undefined>;
    };

    const entries = Object.entries(obj).filter(([, v]) => v !== undefined);

    return Object.fromEntries(entries) as NonUndefined<T>;
}
