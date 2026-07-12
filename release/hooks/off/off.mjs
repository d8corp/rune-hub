import '../slot/index.mjs';
import { slot } from '../slot/slot.mjs';

function off(rune, event, listener) {
    slot(rune).off(event, listener);
}

export { off };
