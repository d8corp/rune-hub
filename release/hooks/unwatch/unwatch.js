'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../hub/index.js');
var hub = require('../hub/hub.js');

/**
 * Executes an action without tracking dependencies.
 * Temporarily disables dependency tracking during execution.
 * Useful when you need to read values without creating reactive relationships.
 * @template A - The action function type
 * @param action - The action to execute without tracking
 * @returns The result of the action
 * @example
 * ```ts
 * const count = () => 5
 *
 * const doubled = () => {
 *   const value = unwatch(() => get(count)) // no dependency created
 *   return value * 2
 * }
 * // doubled won't update when count changes
 * ```
 */
function unwatch(action) {
    return hub.hub().unwatch(action);
}

exports.unwatch = unwatch;
