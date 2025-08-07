/**
 * Deep merge utility for updating nested objects without losing existing properties.
 * Only merges plain objects, arrays and primitives are replaced entirely.
 */

/**
 * Makes all properties in T optional recursively
 */
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

function isPlainObject(obj: unknown): obj is Record<string, unknown> {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * Recursively merges source object into target object.
 * Modifies target object in place and returns it.
 * @param target - Object to merge into
 * @param source - Object to merge from
 * @returns The modified target object
 */
export function deepMerge<T>(target: T, source: DeepPartial<T>): T {
    if (!isPlainObject(target) || !isPlainObject(source)) {
        return target;
    }

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const sourceValue = source[key];
            const targetValue = target[key];

            if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
                // Recursively merge nested objects (cast to avoid complex generic issues)
                deepMerge(targetValue, sourceValue);
            }
            else if (sourceValue !== undefined) {
                // Replace primitive values, arrays, or if target doesn't exist
                (target as Record<string, unknown>)[key] = sourceValue;
            }
        }
    }

    return target;
}

/**
 * Creates a new object with deep merged properties (immutable version).
 * @param target - Base object
 * @param source - Object to merge
 * @returns New merged object
 */
export function deepMergeImmutable<T>(target: T, source: DeepPartial<T>): T {
    const result = structuredClone(target);
    return deepMerge(result, source);
}
