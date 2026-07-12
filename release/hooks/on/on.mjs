import '../slot/index.mjs';
import { slot } from '../slot/slot.mjs';

function on(rune, event, listener) {
    return slot(rune).on(event, listener);
}

export { on };
