import type { QueueItem } from '../Queue';
import { Queue } from '../Queue';
/**
 * Generic function type with configurable parameters and return type.
 * @template P - Array of parameter types
 * @template R - Return type
 * @example
 * ```typescript
 * const add: Fn<[number, number], number> = (a, b) => a + b
 * const log: Fn<[string], void> = (msg) => console.log(msg)
 * ```
 */
export type Fn<P extends any[] = any[], R = any> = (...args: P) => R;
/**
 * A rune is a reactive computation function.
 * Can be a computed value or an effect (side-effect function).
 * Runes are the core building blocks of the reactive system.
 * @template R - The type of value returned by the rune (void for effects)
 * @example
 * ```typescript
 * const counter: Rune<number> = () => 42
 * const effect: Rune<void> = () => console.log('side effect')
 * ```
 */
export type Rune<R = any> = Fn<[], R>;
/**
 * A function that performs cleanup when called.
 * Typically returned by subscription methods to allow unsubscribing.
 * @example
 * ```typescript
 * const unsubscribe: Destructor = on(count, 'change', () => {
 *   console.log('changed')
 * })
 *
 * // Later: unsubscribe()
 * ```
 */
export type Destructor = Fn<[], void>;
/**
 * A listener function that responds to events.
 * Listeners are called when specific events occur on a slot.
 * @example
 * ```typescript
 * const listener: Listener = () => {
 *   console.log('Event triggered!')
 * }
 *
 * slot.on('change', listener)
 * ```
 */
export type Listener = Fn<[], void>;
/**
 * An action is a side-effect function that performs work.
 * Actions are used in batching and context management.
 * @example
 * ```typescript
 * const action: Action = () => {
 *   set(count, raw(count) + 1)
 *   console.log('Action performed')
 * }
 *
 * batch(action)
 * ```
 */
export type Action = Fn<[], void>;
/**
 * Events that can be emitted by a slot during its lifecycle.
 * - `init`: Slot has been initialized
 * - `update`: Slot value is being updated
 * - `call`: Rune function is being called
 * - `change`: Slot value has changed
 * - `clear`: Slot dependencies are being cleared
 * - `destroy`: Slot is being destroyed
 * - `up`: Slot has gained subscribers
 * - `down`: Slot has lost all subscribers
 * - `get`: Fired when a rune's value is accessed
 * @example
 * ```typescript
 * const count = () => 0
 * on(count, 'change', () => console.log('Count changed!'))
 * on(count, 'init', () => console.log('Count initialized'))
 * ```
 */
export type Event = 'init' | 'update' | 'call' | 'change' | 'clear' | 'destroy' | 'up' | 'down' | 'get';
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
export declare class Slot<T = unknown> {
    readonly rune: Rune<T>;
    readonly hub: Hub;
    readonly anon: boolean;
    /** Current value of the slot */
    cur?: T;
    /** Previous value of the slot (before last update) */
    prev?: T;
    /** Whether the slot has active subscribers */
    up: boolean;
    /** Whether the slot has been initialized */
    inited: boolean;
    /** Whether the slot is currently being prepared/initialized */
    prep: boolean;
    /** The slot is a simple state */
    state: boolean;
    /** Whether a set operation occurred during the current computation */
    sets: boolean;
    /** Whether the slot has any subscribers */
    hasSub: boolean;
    /** Queue item indicating this slot is scheduled for recomputation (needs to call force()) */
    queue: QueueItem<Slot> | undefined;
    /** Queue item indicating this slot is scheduled for update notification (needs to call forceUpdate()) */
    updateQueue: QueueItem<Slot> | undefined;
    /** Set of slots that depend on this slot (subscribers) */
    subs: Set<Slot>;
    /** Set of slots this slot depends on (dependencies) */
    deps: Set<Slot>;
    /** Event listeners registered for various slot lifecycle events */
    events: Partial<Record<Event, Listener[]>>;
    activity: Set<Fn>;
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
    constructor(rune: Rune<T>, hub?: Hub, anon?: boolean);
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
    destroy(): void;
    /**
     * Clears any pending recomputation from the queue.
     * @internal
     */
    private clearQueue;
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
    init(): void;
    /**
     * Executes an action within this slot's context.
     * Sets this slot as the current context for dependency tracking.
     * @template A - The action function type
     * @param action - The action to execute
     * @returns The result of the action
     */
    use<A extends Fn<[]>>(action: A): ReturnType<A>;
    clear(): void;
    rawCall(): void;
    /**
     * Calls the rune function to compute a new value.
     * Tracks dependencies and emits 'clear' and 'call' events.
     * @internal
     */
    call(): void;
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
    get raw(): T;
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
    get value(): T;
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
    set value(value: T);
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
    get(): T;
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
    set(value: T): void;
    /**
     * Creates a dependency relationship with another slot.
     * This slot will be notified when the other slot updates.
     * @param slot - The slot to depend on
     * @internal
     */
    bind(slot: Slot): void;
    /**
     * Activates the slot and keeps it active.
     * @returns A destructor function to deactivate
     * @example
     * ```typescript
     * const count = new Slot(() => 0)
     *
     * const log = new Slot(() => {
     *   console.log(count.value)
     * })
     *
     * log.on()
     * count.set(1) // logs: 1
     * ```
     */
    on(): Destructor;
    /**
     * Subscribes to a specific slot event.
     * @param event - The event to listen for
     * @param listener - The listener function to call
     * @returns A destructor function to unsubscribe
     * @example
     * ```typescript
     * const count = new Slot(() => 0)
     *
     * const unsubscribe = count.on('change', () => {
     *   console.log('Value changed to:', count.raw)
     * })
     *
     * slot.set(42) // Logs: Value changed to: 42
     * unsubscribe() // Stop listening
     * ```
     */
    on(event: Event, listener: Listener): Destructor;
    /**
     * Deactivates the slot and removes all its dependencies.
     */
    off(): void;
    /**
     * Unsubscribes a specific listener from an event.
     * @param event - The event to unsubscribe from
     * @param listener - The listener to remove
     */
    off(event: Event, listener: Listener): void;
    /**
     * Triggers a list of event listeners.
     * Executes listeners in a batched, unwatched context.
     * @param events - Array of listener functions to call
     * @internal
     */
    event(events?: Listener[]): void;
    /**
     * Schedules an update notification for this slot.
     * Queues the slot for update processing in the next batch.
     */
    update(): void;
    /**
     * Forces recomputation of the slot's value.
     * Recomputes dependencies and schedules updates.
     * @internal
     */
    force(): void;
    /**
     * Forces immediate update notification to subscribers.
     * Emits 'update' and 'change' events and propagates to subscribers.
     * @internal
     */
    forceUpdate(): void;
}
/**
 * Hub manages the reactive system's execution context and slot lifecycle.
 * It handles batching updates, tracking dependencies, and managing slot instances.
 */
export declare class Hub {
    /** The root hub instance used as the default hub */
    static root: Hub;
    /** The currently active hub during execution */
    static cur: Hub | undefined;
    /**
     * Default slot constructor function.
     * @template T - The type of value managed by the slot
     * @param rune - The rune function
     * @param hub - The hub that owns the slot
     * @param detached - Whether the slot is detached (anonymous)
     * @returns A new Slot instance
     */
    static slot<T = unknown>(rune: Rune<T>, hub?: Hub, detached?: boolean): Slot<T>;
    /** The currently executing slot (for dependency tracking) */
    ctx: Slot | undefined;
    /** Map of runes to their corresponding slots */
    readonly slots: Map<Rune, Slot>;
    /** Whether dependency tracking is currently disabled */
    unwatching: boolean;
    /** Whether updates are currently being batched */
    batching: boolean;
    /** Queue for managing slot updates */
    readonly queue: Queue<Slot>;
    /**
     * Creates a slot for a rune using its custom cast function if available.
     * @template T - The type of value managed by the slot
     * @param rune - The rune to create a slot for
     * @returns A new Slot instance
     */
    cast<T = unknown>(rune: Rune<T>): Slot<T>;
    /**
     * Executes an action within this hub's context.
     * Sets this hub as the current hub during execution.
     * @template A - The action function type
     * @param action - The action to execute
     * @returns The result of the action
     */
    use<A extends Fn<[]>>(action: A): ReturnType<A>;
    /**
     * Executes an action without tracking dependencies.
     * Temporarily disables dependency tracking during execution.
     * @template A - The action function type
     * @param action - The action to execute
     * @returns The result of the action
     */
    unwatch<A extends Fn<[]>>(action: A): ReturnType<A>;
    /**
     * Batches multiple updates together for efficient processing.
     * Updates are queued and processed together after the action completes.
     * @param action - The action to execute in batch mode
     */
    batch(action: Action): void;
    /**
     * Processes all queued updates and ends batch mode.
     * Flushes the update queue and notifies all affected slots.
     * @internal
     */
    endBatching(): void;
    /**
     * Destroys the hub and all its slots.
     * Cleans up all resources and resets the hub state.
     */
    destroy(): void;
}
