import type { Rune } from '../../RuneHub';
/**
 * Sets a new value for a rune.
 * If the value differs from the current value, schedules an update and notifies subscribers.
 * @template T - The rune function type
 * @param rune - The rune to set the value for
 * @param value - The new value to set
 * @example
 * ```ts
 * const count = () => 5
 *
 * set(count, 10)
 * get(count) // 10
 * ```
 */
export declare function set<T extends Rune>(rune: T, value: ReturnType<T>): void;
