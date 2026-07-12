import type { Event, Listener, Rune } from '../../RuneHub';
/**
 * Deactivates a rune and removes all its dependencies.
 * Cleans up dependency relationships but does not remove event listeners.
 * @param rune - The rune to deactivate
 * @example
 * ```ts
 * const count = () => 5
 * const effect = () =>  console.log('Count:', get(count))
 *
 * on(effect) // logs: 'Count: 5'
 * set(count, 10) // logs: 'Count: 10'
 * off(effect) // stop effect
 * set(count, 20) // no log
 * ```
 */
export declare function off(rune: Rune): void;
/**
 * Unsubscribes a specific listener from a rune event.
 * @param rune - The rune to unsubscribe from
 * @param event - The event to unsubscribe from
 * @param listener - The listener function to remove
 * @example
 * ```ts
 * const count = () => 5
 * const listener = () => console.log('changed')
 * on(count, 'change', listener)
 * off(count, 'change', listener) // remove specific listener
 * ```
 */
export declare function off(rune: Rune, event: Event, listener: Listener): void;
