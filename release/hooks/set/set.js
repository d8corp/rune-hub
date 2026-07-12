'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../slot/index.js');
var slot = require('../slot/slot.js');

/**
 * Sets a new value for a rune.
 * If the value differs from the current value, schedules an update and notifies subscribers.
 * @template T - The rune function type
 * @param rune - The rune to set the value for
 * @param value - The new value to set
 * @example
 * ```ts
 * const count = () => 5
 *
 * set(count, 10)
 * get(count) // 10
 * ```
 */
function set(rune, value) {
    slot.slot(rune).set(value);
}

exports.set = set;
