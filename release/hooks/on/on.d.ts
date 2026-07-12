import type { Destructor, Event, Listener, Rune } from '../../RuneHub';
/**
 * Activates a rune by subscribing to it.
 * Keeps the rune and its dependencies active until unsubscribed.
 * @param rune - The rune to activate
 * @returns A destructor function to deactivate and unsubscribe
 * @example
 * ```ts
 * const count = () => 5
 * const effect = () => console.log('Count:', get(count))
 *
 * const off = on(effect) // logs: 'Count: 5'
 * set(count, 10) // logs: 'Count: 10'
 * off() // stop effect
 * ```
 */
export declare function on(rune: Rune): Destructor;
/**
 * Subscribes to a specific event on a rune.
 * @param rune - The rune to subscribe to
 * @param event - The event to listen for ('init', 'update', 'call', 'change', 'clear', 'destroy', 'up', 'down')
 * @param listener - The listener function to call when the event occurs
 * @returns A destructor function to unsubscribe
 * @example
 * ```ts
 * const count = () => 5
 * const off = on(count, 'change', () => console.log('changed'))
 * set(count, 10) // logs: 'changed'
 * off() // unsubscribe
 * ```
 */
export declare function on(rune: Rune, event: Event, listener: Listener): Destructor;
