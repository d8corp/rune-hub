'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../hub/index.js');
var hub = require('../hub/hub.js');

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
    const currentHub = hub.hub();
    return currentHub.slots.get(rune);
}

exports.getSlot = getSlot;
