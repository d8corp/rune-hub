import { getSlot } from '../getSlot'

import type { Rune } from '../../RuneHub'

/**
 * Schedules an update notification for a rune.
 * Forces the rune to notify its subscribers even if the value hasn't changed.
 * Does nothing if the slot doesn't exist yet.
 * @param rune - The rune to update
 * @example
 * ```ts
 * const count = () => [0]
 *
 * on(() => console.log(get(count)))
 * // logs: [0]
 *
 * get(count).push(1)
 * update(count)
 * // logs: [0, 1]
 * ```
 */
export function update (rune: Rune): void {
  const slot = getSlot(rune)

  if (!slot) return

  slot.update()
}
