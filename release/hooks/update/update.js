'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../getSlot/index.js');
var getSlot = require('../getSlot/getSlot.js');

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
function update(rune) {
    const slot = getSlot.getSlot(rune);
    if (!slot)
        return;
    slot.update();
}

exports.update = update;
