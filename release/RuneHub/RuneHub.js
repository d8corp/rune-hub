'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('../Queue/index.js');
var Queue = require('../Queue/Queue.js');

/**
 * A Slot manages the reactive state and dependencies for a rune.
 * It tracks subscribers, dependencies, and handles updates in the reactive graph.
 * @template T - The type of value managed by this slot
 * @example
 * ```typescript
 * const count = new Slot(() => 0)
 *
 * // Subscribe to changes
 * count.on('change', () => console.log('Changed to:', count.raw))
 *
 * // Set new value
 * count.set(5)
 * ```
 */
class Slot {
    /**
     * Creates a new Slot for managing a rune's reactive state.
     * @param rune - The rune function to manage
     * @param hub - The hub that owns this slot (defaults to root hub)
     * @param anon - Whether this is an anonymous slot (not registered in hub)
     * @example
     * ```typescript
     * const count = () => 0
     * const slot = new Slot(count, Hub.root, false)
     * ```
     */
    constructor(rune, hub = Hub.root, anon = hub === Hub.root) {
        this.rune = rune;
        this.hub = hub;
        this.anon = anon;
        /** Whether the slot has active subscribers */
        this.up = false;
        /** Whether the slot has been initialized */
        this.inited = false;
        /** Whether the slot is currently being prepared/initialized */
        this.prep = false;
        /** The slot is a simple state */
        this.state = false;
        /** Whether a set operation occurred during the current computation */
        this.sets = false;
        /** Whether the slot has any subscribers */
        this.hasSub = false;
        /** Set of slots that depend on this slot (subscribers) */
        this.subs = new Set();
        /** Set of slots this slot depends on (dependencies) */
        this.deps = new Set();
        /** Event listeners registered for various slot lifecycle events */
        this.events = {};
        this.activity = new Set();
        if (!anon) {
            hub.slots.set(rune, this);
        }
    }
    /**
     * Destroys the slot, cleaning up all subscriptions and removing it from the hub.
     * Emits 'clear' and 'destroy' events before cleanup.
     * @example
     * ```typescript
     * const slot = new Slot(() => 0)
     *
     * slot.on('change', () => console.log('changed'))
     * slot.destroy() // Cleans up all subscriptions and remove from hub
     * ```
     */
    destroy() {
        this.event(this.events.destroy);
        this.off();
        this.up = false;
        this.prep = false;
        this.inited = false;
        this.clearQueue();
        if (!this.anon) {
            this.hub.slots.delete(this.rune);
        }
    }
    /**
     * Clears any pending recomputation from the queue.
     * @internal
     */
    clearQueue() {
        if (this.queue) {
            this.queue.abort();
            this.queue = undefined;
        }
    }
    /**
     * Initializes the slot by computing its initial value.
     * Runs the rune function and tracks dependencies.
     * Emits 'init' event when complete.
     * @example
     * ```typescript
     * const slot = new Slot(() => 42)
     *
     * console.log(slot.cur) // undefined
     * slot.init() // Computes initial value and emits 'init'
     * console.log(slot.cur) // 42
     * ```
     */
    init() {
        if (this.prep)
            return;
        this.prep = true;
        this.call();
        this.inited = true;
        this.event(this.events.init);
    }
    /**
     * Executes an action within this slot's context.
     * Sets this slot as the current context for dependency tracking.
     * @template A - The action function type
     * @param action - The action to execute
     * @returns The result of the action
     */
    use(action) {
        const hub = this.hub;
        const prevSlot = hub.ctx;
        if (prevSlot === this) {
            return hub.use(action);
        }
        hub.ctx = this;
        const result = hub.use(action);
        hub.ctx = prevSlot;
        return result;
    }
    clear() {
        if (!this.inited)
            return;
        this.event(this.events.clear);
    }
    rawCall() {
        this.sets = false;
        this.use(() => {
            if (!this.updateQueue) {
                this.prev = this.cur;
            }
            this.cur = this.rune();
            this.event(this.events.call);
        });
    }
    /**
     * Calls the rune function to compute a new value.
     * Tracks dependencies and emits 'clear' and 'call' events.
     * @internal
     */
    call() {
        do {
            this.clear();
            this.clearQueue();
            this.rawCall();
        } while (this.queue);
    }
    /**
     * Gets the current value without tracking dependencies.
     * Initializes the slot if needed and forces any pending updates.
     * @returns The current value
     * @example
     * ```typescript
     * const slot = new Slot(() => 42)
     *
     * console.log(slot.raw) // 42, no dependency tracking
     * ```
     */
    get raw() {
        this.event(this.events.get);
        this.init();
        if (this.queue) {
            this.force();
        }
        return this.cur;
    }
    /**
     * Gets the current value with dependency tracking.
     * Alias for the get() method.
     * @example
     * ```typescript
     * const slot = new Slot(() => 0)
     *
     * on(() => {
     *   console.log(slot.value) // Tracks dependency
     * })
     * ```
     */
    get value() {
        return this.get();
    }
    /**
     * Sets a new value for the slot.
     * Alias for the set() method.
     * @example
     * ```typescript
     * const slot = new Slot(() => 0)
     *
     * slot.value = 42 // Sets new value
     * console.log(slot.value) // 42
     * ```
     */
    set value(value) {
        this.set(value);
    }
    /**
     * Gets the current value and tracks this slot as a dependency.
     * If called within another slot's context, creates a dependency relationship.
     * @returns The current value
     * @example
     * ```typescript
     * const count = new Slot(() => 0)
     *
     * on(() => {
     *   console.log(count.get())
     * })
     * ```
     */
    get() {
        const result = this.raw;
        if (this.hub.ctx && !this.hub.unwatching) {
            this.hub.ctx.bind(this);
        }
        return result;
    }
    /**
     * Sets a new value for the slot.
     * If the value differs from the current value, schedules an update.
     * @param value - The new value to set
     * @example
     * ```typescript
     * const count = new Slot(() => 0)
     * count.on('change', () => console.log('Changed to:', count.raw))
     *
     * slot.set(42) // Logs: Changed to: 42
     * slot.set(42) // No change, no log
     * ```
     */
    set(value) {
        if (this.hub.ctx) {
            this.hub.ctx.sets = true;
        }
        if (this.raw !== value) {
            if (!this.updateQueue) {
                this.prev = this.cur;
            }
            this.cur = value;
            this.update();
        }
    }
    /**
     * Creates a dependency relationship with another slot.
     * This slot will be notified when the other slot updates.
     * @param slot - The slot to depend on
     * @internal
     */
    bind(slot) {
        this.deps.add(slot);
        slot.subs.add(this);
        slot.hasSub = true;
        if (!slot.up) {
            slot.up = true;
            slot.event(slot.events.up);
        }
    }
    on(event, listener) {
        if (!event) {
            if (!this.up) {
                this.up = true;
                if (!this.inited) {
                    this.init();
                }
                else if (!this.state) {
                    this.call();
                }
                if (!this.deps.size) {
                    this.state = true;
                }
                this.event(this.events.up);
            }
            if (this.hub.ctx && !this.hub.unwatching) {
                this.hub.ctx.bind(this);
            }
            const activation = () => {
                if (this.activity.size === 1) {
                    if (this.activity.has(activation)) {
                        this.off();
                    }
                    return;
                }
                this.activity.delete(activation);
            };
            this.activity.add(activation);
            return activation;
        }
        const events = this.events[event];
        if (!events) {
            this.events[event] = [listener];
        }
        else {
            events.push(listener);
        }
        return this.off.bind(this, event, listener);
    }
    off(event, listener) {
        if (!event) {
            this.clear();
            this.activity.clear();
            this.deps.forEach((source) => {
                const sourceListeners = source.subs;
                if (sourceListeners.size === 1) {
                    source.off();
                }
                else {
                    sourceListeners.delete(this);
                }
            });
            this.deps.clear();
            this.subs.forEach(sub => sub.deps.delete(this));
            this.subs.clear();
            this.hasSub = false;
            this.up = false;
            this.event(this.events.down);
            return;
        }
        const events = this.events[event];
        if (!events)
            return;
        this.events[event] = events.filter((l) => l !== listener);
    }
    /**
     * Triggers a list of event listeners.
     * Executes listeners in a batched, unwatched context.
     * @param events - Array of listener functions to call
     * @internal
     */
    event(events) {
        if (!events || !events.length)
            return;
        const hub = this.hub;
        this.use(() => {
            hub.unwatch(() => {
                hub.batch(() => {
                    for (let i = 0; i < events.length; i++) {
                        events[i]();
                    }
                });
            });
        });
    }
    /**
     * Schedules an update notification for this slot.
     * Queues the slot for update processing in the next batch.
     */
    update() {
        if (this.updateQueue)
            return;
        this.hub.batch(() => {
            this.updateQueue = this.hub.queue.force(this);
        });
    }
    /**
     * Forces recomputation of the slot's value.
     * Recomputes dependencies and schedules updates.
     * @internal
     */
    force() {
        if (!this.deps.size) {
            this.clearQueue();
            this.update();
            return;
        }
        do {
            this.clear();
            this.clearQueue();
            const deps = this.deps;
            const newDeps = new Set();
            this.deps = newDeps;
            this.rawCall();
            for (const dep of deps) {
                if (!newDeps.has(dep)) {
                    dep.off();
                }
            }
            if (this.inited) {
                this.update();
            }
        } while (this.queue);
    }
    /**
     * Forces immediate update notification to subscribers.
     * Emits 'update' and 'change' events and propagates to subscribers.
     * @internal
     */
    forceUpdate() {
        const updateQueue = this.updateQueue;
        if (updateQueue) {
            updateQueue.abort();
            this.updateQueue = undefined;
        }
        this.event(this.events.update);
        if (this.prev !== this.cur) {
            this.event(this.events.change);
            if (this.hasSub) {
                for (const sub of this.subs) {
                    if (sub.queue)
                        continue;
                    if (sub.hasSub || sub.sets) {
                        sub.force();
                    }
                    else {
                        sub.queue = this.hub.queue.push(sub);
                    }
                }
            }
        }
    }
}
/**
 * Hub manages the reactive system's execution context and slot lifecycle.
 * It handles batching updates, tracking dependencies, and managing slot instances.
 */
class Hub {
    constructor() {
        /** Map of runes to their corresponding slots */
        this.slots = new Map();
        /** Whether dependency tracking is currently disabled */
        this.unwatching = false;
        /** Whether updates are currently being batched */
        this.batching = false;
        /** Queue for managing slot updates */
        this.queue = new Queue.Queue();
    }
    /**
     * Default slot constructor function.
     * @template T - The type of value managed by the slot
     * @param rune - The rune function
     * @param hub - The hub that owns the slot
     * @param detached - Whether the slot is detached (anonymous)
     * @returns A new Slot instance
     */
    static slot(rune, hub, detached) {
        return new Slot(rune, hub, detached);
    }
    /**
     * Creates a slot for a rune using its custom cast function if available.
     * @template T - The type of value managed by the slot
     * @param rune - The rune to create a slot for
     * @returns A new Slot instance
     */
    cast(rune) {
        return Hub.slot(rune, this, false);
    }
    /**
     * Executes an action within this hub's context.
     * Sets this hub as the current hub during execution.
     * @template A - The action function type
     * @param action - The action to execute
     * @returns The result of the action
     */
    use(action) {
        const prevHub = Hub.cur;
        Hub.cur = this;
        const result = action();
        Hub.cur = prevHub;
        return result;
    }
    /**
     * Executes an action without tracking dependencies.
     * Temporarily disables dependency tracking during execution.
     * @template A - The action function type
     * @param action - The action to execute
     * @returns The result of the action
     */
    unwatch(action) {
        const prevUnwatch = this.unwatching;
        this.unwatching = true;
        const result = action();
        this.unwatching = prevUnwatch;
        return result;
    }
    /**
     * Batches multiple updates together for efficient processing.
     * Updates are queued and processed together after the action completes.
     * @param action - The action to execute in batch mode
     */
    batch(action) {
        if (this.batching) {
            action();
            return;
        }
        this.batching = true;
        action();
        this.endBatching();
    }
    /**
     * Processes all queued updates and ends batch mode.
     * Flushes the update queue and notifies all affected slots.
     * @internal
     */
    endBatching() {
        if (!this.batching)
            return;
        if (!this.queue.size) {
            this.batching = false;
            return;
        }
        const queue = this.queue;
        let item;
        while ((item = queue.start)) {
            if (item.forced) {
                item.value.forceUpdate();
            }
            else {
                item.value.force();
            }
        }
        this.batching = false;
    }
    /**
     * Destroys the hub and all its slots.
     * Cleans up all resources and resets the hub state.
     */
    destroy() {
        this.slots.forEach((slot) => {
            slot.destroy();
        });
        this.slots.clear();
        this.queue.clear();
        this.batching = false;
        this.unwatching = false;
        this.ctx = undefined;
    }
}
/** The root hub instance used as the default hub */
Hub.root = new Hub();

exports.Hub = Hub;
exports.Slot = Slot;
