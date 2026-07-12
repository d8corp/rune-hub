'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../slot/index.js');
var slot = require('../slot/slot.js');

/**
 * Gets the current value of a rune with dependency tracking.
 * If called within another rune's computation, creates a dependency relationship.
 * @template T - The rune function type
 * @param rune - The rune to get the value from
 * @returns The current value of the rune
 * @example
 * ```ts
 * const count = () => 5
 * const value = get(count) // 5
 * ```
 */
function get(rune) {
    return slot.slot(rune).get();
}

exports.get = get;
