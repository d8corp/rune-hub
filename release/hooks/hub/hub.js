'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../../RuneHub/index.js');
var RuneHub = require('../../RuneHub/RuneHub.js');

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
function hub() {
    var _a;
    return (_a = RuneHub.Hub.cur) !== null && _a !== void 0 ? _a : RuneHub.Hub.root;
}

exports.hub = hub;
