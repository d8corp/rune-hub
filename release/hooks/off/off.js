'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../slot/index.js');
var slot = require('../slot/slot.js');

function off(rune, event, listener) {
    slot.slot(rune).off(event, listener);
}

exports.off = off;
