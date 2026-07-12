'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../slot/index.js');
var slot = require('../slot/slot.js');

function on(rune, event, listener) {
    return slot.slot(rune).on(event, listener);
}

exports.on = on;
