import '../hub/index.mjs';
import { hub } from '../hub/hub.mjs';

/**
 * Gets an existing slot for a rune without creating it.
 * Returns undefined if the slot doesn't exist yet.
 * @template T - The rune function type
 * @param rune - The rune to get the slot for
 * @returns The slot if it exists, undefined otherwise
 * @example
 * ```ts
 * const count = () => 5
 * getSlot(count) // undefined (not created yet)
 * get(count) // 5 (creates slot)
 * getSlot(count) // Slot instance
 * ```
 */
function getSlot(rune) {
    const currentHub = hub();
    return currentHub.slots.get(rune);
}

export { getSlot };
