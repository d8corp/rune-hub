import { Hub } from '../../RuneHub';
/**
 * Gets the currently active hub.
 * Returns the current hub if one is active, otherwise returns the root hub.
 * @returns The current or root hub instance
 * @example
 * ```ts
 * const customHub = new Hub()
 *
 * customHub.use(() => {
 *   console.log(hub() === customHub)
 *   // true
 * })
 * ```
 */
export declare function hub(): Hub;
