import type { Rune } from '../../RuneHub';
/**
 * Gets the current value of a rune with dependency tracking.
 * If called within another rune's computation, creates a dependency relationship.
 * @template T - The rune function type
 * @param rune - The rune to get the value from
 * @returns The current value of the rune
 * @example
 * ```ts
 * const count = () => 5
 * const value = get(count) // 5
 * ```
 */
export declare function get<T extends Rune>(rune: T): ReturnType<T>;
