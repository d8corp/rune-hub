'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../hub/index.js');
var hub = require('../hub/hub.js');

/**
 * Batches multiple updates together for efficient processing.
 * All updates within the action are queued and processed together after completion.
 * This prevents unnecessary intermediate updates and improves performance.
 * @param action - The action containing multiple updates to batch
 * @example
 * ```ts
 * const a = () => 0
 * const b = () => 0
 * const sum = () => get(a) + get(b)
 * const log = () => console.log(get(sum))
 *
 * on(log)
 * // logs: 0
 *
 * batch(() => {
 *   set(a, 400)
 *   set(b, 20)
 * })
 * // logs: 420
 * ```
 */
function batch(action) {
    hub.hub().batch(action);
}

exports.batch = batch;
