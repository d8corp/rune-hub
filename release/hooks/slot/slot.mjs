import '../hub/index.mjs';
import { hub } from '../hub/hub.mjs';

/**
 * Gets or creates a slot for a rune.
 * If the slot doesn't exist, creates it using the rune's custom cast function or default constructor.
 * @template T - The rune function type
 * @param rune - The rune to get or create a slot for
 * @returns The slot managing the rune's state
 * @example
 * ```ts
 * const count = () => 5
 *
 * const countSlot = slot(count)
 * countSlot.get() // 5
 * ```
 */
function slot(rune) {
    const currentHub = hub();
    const slot = currentHub.slots.get(rune);
    if (!slot) {
        return currentHub.cast(rune);
    }
    return slot;
}

export { slot };
