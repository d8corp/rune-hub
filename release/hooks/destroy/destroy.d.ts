import type { Rune } from '../../RuneHub';
/**
 * Destroys a rune's slot, cleaning up all subscriptions and removing it from the hub.
 * Emits 'clear' and 'destroy' events before cleanup.
 * Does nothing if the slot doesn't exist yet.
 * @param rune - The rune to destroy
 * @example
 * ```ts
 * const count = () => 5
 * get(count) // creates slot
 * destroy(count) // removes slot and cleans up
 * getSlot(count) // undefined
 * ```
 */
export declare function destroy(rune: Rune): void;
