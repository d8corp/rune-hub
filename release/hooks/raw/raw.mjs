import '../slot/index.mjs';
import { slot } from '../slot/slot.mjs';

/**
 * Gets the current value of a rune without tracking dependencies.
 * Unlike get(), this does not create a dependency relationship.
 * Useful when you need to read a value without triggering reactivity.
 * @template T - The rune function type
 * @param rune - The rune to get the value from
 * @returns The current value of the rune
 * @example
 * ```ts
 * const count = () => 5
 * const value = raw(count) // 5, no dependency tracked
 * ```
 */
function raw(rune) {
    return slot(rune).raw;
}

export { raw };
