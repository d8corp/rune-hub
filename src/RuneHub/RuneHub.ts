import type { QueueItem } from '../Queue'
import { Queue } from '../Queue'

/**
 * Generic function type with configurable parameters and return type.
 * @template P - Array of parameter types
 * @template R - Return type
 */
export type Fn<P extends any[] = any[], R = any> = (...args: P) => R

/**
 * A rune is a reactive computation function.
 * Can be a computed value or an effect (side-effect function).
 * Runes are the core building blocks of the reactive system.
 * @template R - The type of value returned by the rune (void for effects)
 */
export type Rune<R = any> = Fn<[], R>

/**
 * A function that performs cleanup when called.
 * Typically returned by subscription methods to allow unsubscribing.
 */
export type Destructor = Fn<[], void>

/**
 * A listener function that responds to events.
 * Listeners are called when specific events occur on a slot.
 */
export type Listener = Fn<[], void>

/**
 * An action is a side-effect function that performs work.
 * Actions are used in batching and context management.
 */
export type Action = Fn<[], void>

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
 */
export type Event = 'init' | 'update' | 'call' | 'change' | 'clear' | 'destroy' | 'up' | 'down' | 'get'

/**
 * A Slot manages the reactive state and dependencies for a rune.
 * It tracks subscribers, dependencies, and handles updates in the reactive graph.
 * @template T - The type of value managed by this slot
 */
export class Slot<T = unknown> {
  /** Current value of the slot */
  cur?: T

  /** Previous value of the slot (before last update) */
  prev?: T

  /** Whether the slot has active subscribers */
  up: boolean = false

  /** Whether the slot has been initialized */
  inited: boolean = false

  /** Whether the slot is currently being prepared/initialized */
  prep: boolean = false

  /** The slot is a simple state */
  state: boolean = false

  /** Whether a set operation occurred during the current computation */
  sets: boolean = false

  /** Whether the slot has any subscribers */
  hasSub: boolean = false

  /** Queue item indicating this slot is scheduled for recomputation (needs to call force()) */
  queue: QueueItem<Slot> | undefined

  /** Queue item indicating this slot is scheduled for update notification (needs to call forceUpdate()) */
  updateQueue: QueueItem<Slot> | undefined

  /** Set of slots that depend on this slot (subscribers) */
  subs: Set<Slot> = new Set<Slot>()

  /** Set of slots this slot depends on (dependencies) */
  deps: Set<Slot> = new Set<Slot>()

  /** Event listeners registered for various slot lifecycle events */
  events: Partial<Record<Event, Listener[]>> = {}

  activity: Set<Fn> = new Set()

  /**
   * Creates a new Slot for managing a rune's reactive state.
   * @param rune - The rune function to manage
   * @param hub - The hub that owns this slot (defaults to root hub)
   * @param anon - Whether this is an anonymous slot (not registered in hub)
   */
  constructor (
    readonly rune: Rune<T>,
    readonly hub: Hub = Hub.root,
    readonly anon: boolean = hub === Hub.root,
  ) {
    if (!anon) {
      hub.slots.set(rune, this)
    }
  }

  /**
   * Destroys the slot, cleaning up all subscriptions and removing it from the hub.
   * Emits 'clear' and 'destroy' events before cleanup.
   */
  destroy (): void {
    this.event(this.events.destroy)

    this.off()

    this.up = false
    this.prep = false
    this.inited = false

    this.clearQueue()

    if (!this.anon) {
      this.hub.slots.delete(this.rune)
    }
  }

  /**
   * Clears any pending recomputation from the queue.
   * @internal
   */
  private clearQueue () {
    if (this.queue) {
      this.queue.abort()
      this.queue = undefined
    }
  }

  /**
   * Initializes the slot by computing its initial value.
   * Runs the rune function and tracks dependencies.
   * Emits 'init' event when complete.
   */
  init (): void {
    if (this.prep) return
    this.prep = true

    this.call()

    this.inited = true
    this.event(this.events.init)
  }

  /**
   * Executes an action within this slot's context.
   * Sets this slot as the current context for dependency tracking.
   * @template A - The action function type
   * @param action - The action to execute
   * @returns The result of the action
   */
  use <A extends Fn<[]>> (action: A): ReturnType<A> {
    const hub = this.hub
    const prevSlot = hub.ctx

    if (prevSlot === this) {
      return hub.use(action)
    }

    hub.ctx = this
    const result = hub.use(action)
    hub.ctx = prevSlot

    return result
  }

  clear () {
    if (!this.inited) return

    this.event(this.events.clear)
  }

  rawCall (): void {
    this.sets = false

    this.use(() => {
      if (!this.updateQueue) {
        this.prev = this.cur
      }

      this.cur = this.rune()

      this.event(this.events.call)
    })
  }

  /**
   * Calls the rune function to compute a new value.
   * Tracks dependencies and emits 'clear' and 'call' events.
   * @internal
   */
  call () {
    do {
      this.clear()
      this.clearQueue()
      this.rawCall()
    } while (this.queue)
  }

  /**
   * Gets the current value without tracking dependencies.
   * Initializes the slot if needed and forces any pending updates.
   * @returns The current value
   */
  get raw (): T {
    this.event(this.events.get)
    this.init()

    if (this.queue) {
      this.force()
    }

    return this.cur!
  }

  /**
   * Gets the current value with dependency tracking.
   * Alias for the get() method.
   */
  get value (): T {
    return this.get()
  }

  /**
   * Sets a new value for the slot.
   * Alias for the set() method.
   */
  set value (value: T) {
    this.set(value)
  }

  /**
   * Gets the current value and tracks this slot as a dependency.
   * If called within another slot's context, creates a dependency relationship.
   * @returns The current value
   */
  get (): T {
    const result = this.raw

    if (this.hub.ctx && !this.hub.unwatching) {
      this.hub.ctx.bind(this)
    }

    return result
  }

  /**
   * Sets a new value for the slot.
   * If the value differs from the current value, schedules an update.
   * @param value - The new value to set
   */
  set (value: T): void {
    if (this.hub.ctx) {
      this.hub.ctx.sets = true
    }

    if (this.raw !== value) {
      if (!this.updateQueue) {
        this.prev = this.cur
      }

      this.cur = value
      this.update()
    }
  }

  /**
   * Creates a dependency relationship with another slot.
   * This slot will be notified when the other slot updates.
   * @param slot - The slot to depend on
   * @internal
   */
  bind (slot: Slot): void {
    this.deps.add(slot)
    slot.subs.add(this)
    slot.hasSub = true

    if (!slot.up) {
      slot.up = true
      slot.event(slot.events.up)
    }
  }

  /**
   * Activates the slot and keeps it active.
   * @returns A destructor function to deactivate
   */
  on (): Destructor
  /**
   * Subscribes to a specific slot event.
   * @param event - The event to listen for
   * @param listener - The listener function to call
   * @returns A destructor function to unsubscribe
   */
  on (event: Event, listener: Listener): Destructor
  on (event?: Event, listener?: Listener) {
    if (!event) {
      if (!this.up) {
        this.up = true

        if (!this.inited) {
          this.init()
        } else if (!this.state) {
          this.call()
        }

        if (!this.deps.size) {
          this.state = true
        }

        this.event(this.events.up)
      }

      if (this.hub.ctx && !this.hub.unwatching) {
        this.hub.ctx.bind(this)
      }

      const activation = () => {
        if (this.activity.size === 1) {
          if (this.activity.has(activation)) {
            this.off()
          }

          return
        }

        this.activity.delete(activation)
      }

      this.activity.add(activation)

      return activation
    }

    const events = this.events[event]

    if (!events) {
      this.events[event] = [listener!]
    } else {
      events.push(listener!)
    }

    return this.off.bind(this, event, listener!)
  }

  /**
   * Deactivates the slot and removes all its dependencies.
   */
  off (): void
  /**
   * Unsubscribes a specific listener from an event.
   * @param event - The event to unsubscribe from
   * @param listener - The listener to remove
   */
  off (event: Event, listener: Listener): void
  off (event?: Event, listener?: Listener) {
    if (!event) {
      this.clear()
      this.activity.clear()

      this.deps.forEach((source) => {
        const sourceListeners = source.subs

        if (sourceListeners.size === 1) {
          source.off()
        } else {
          sourceListeners.delete(this)
        }
      })

      this.deps.clear()
      this.subs.forEach(sub => sub.deps.delete(this))
      this.subs.clear()
      this.hasSub = false
      this.up = false
      this.event(this.events.down)

      return
    }

    const events = this.events[event]

    if (!events) return

    this.events[event] = events.filter((l) => l !== listener)
  }

  /**
   * Triggers a list of event listeners.
   * Executes listeners in a batched, unwatched context.
   * @param events - Array of listener functions to call
   * @internal
   */
  event (events?: Listener[]): void {
    if (!events || !events.length) return

    const hub = this.hub

    this.use(() => {
      hub.unwatch(() => {
        hub.batch(() => {
          for (let i = 0; i < events.length; i++) {
            events[i]()
          }
        })
      })
    })
  }

  /**
   * Schedules an update notification for this slot.
   * Queues the slot for update processing in the next batch.
   */
  update (): void {
    if (this.updateQueue) return

    this.hub.batch(() => {
      this.updateQueue = this.hub.queue.force(this)
    })
  }

  /**
   * Forces recomputation of the slot's value.
   * Recomputes dependencies and schedules updates.
   * @internal
   */
  force () {
    if (!this.deps.size) {
      this.clearQueue()

      this.update()

      return
    }

    do {
      this.clear()
      this.clearQueue()
      const deps = this.deps
      const newDeps = new Set<Slot>()
      this.deps = newDeps
      this.rawCall()

      for (const dep of deps) {
        if (!newDeps.has(dep)) {
          dep.off()
        }
      }

      if (this.inited) {
        this.update()
      }
    } while (this.queue)
  }

  /**
   * Forces immediate update notification to subscribers.
   * Emits 'update' and 'change' events and propagates to subscribers.
   * @internal
   */
  forceUpdate () {
    const updateQueue = this.updateQueue

    if (updateQueue) {
      updateQueue.abort()
      this.updateQueue = undefined
    }

    this.event(this.events.update)

    if (this.prev !== this.cur) {
      this.event(this.events.change)

      if (this.hasSub) {
        for (const sub of this.subs) {
          if (sub.queue) continue

          if (sub.hasSub || sub.sets) {
            sub.force()
          } else {
            sub.queue = this.hub.queue.push(sub)
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
export class Hub {
  /** The root hub instance used as the default hub */
  static root = new Hub()

  /** The currently active hub during execution */
  static cur: Hub | undefined

  /**
   * Default slot constructor function.
   * @template T - The type of value managed by the slot
   * @param rune - The rune function
   * @param hub - The hub that owns the slot
   * @param detached - Whether the slot is detached (anonymous)
   * @returns A new Slot instance
   */
  static slot <T = unknown> (rune: Rune<T>, hub?: Hub, detached?: boolean): Slot<T> {
    return new Slot<T>(rune, hub, detached)
  }

  /** The currently executing slot (for dependency tracking) */
  ctx: Slot | undefined

  /** Map of runes to their corresponding slots */
  readonly slots: Map<Rune, Slot> = new Map()

  /** Whether dependency tracking is currently disabled */
  unwatching: boolean = false

  /** Whether updates are currently being batched */
  batching = false

  /** Queue for managing slot updates */
  readonly queue: Queue<Slot> = new Queue()

  /**
   * Creates a slot for a rune using its custom cast function if available.
   * @template T - The type of value managed by the slot
   * @param rune - The rune to create a slot for
   * @returns A new Slot instance
   */
  cast<T = unknown> (rune: Rune<T>): Slot<T> {
    return Hub.slot(rune, this, false)
  }

  /**
   * Executes an action within this hub's context.
   * Sets this hub as the current hub during execution.
   * @template A - The action function type
   * @param action - The action to execute
   * @returns The result of the action
   */
  use <A extends Fn<[]>> (action: A): ReturnType<A> {
    const prevHub = Hub.cur
    Hub.cur = this
    const result = action()
    Hub.cur = prevHub

    return result
  }

  /**
   * Executes an action without tracking dependencies.
   * Temporarily disables dependency tracking during execution.
   * @template A - The action function type
   * @param action - The action to execute
   * @returns The result of the action
   */
  unwatch <A extends Fn<[]>> (action: A): ReturnType<A> {
    const prevUnwatch = this.unwatching
    this.unwatching = true
    const result = action()
    this.unwatching = prevUnwatch

    return result
  }

  /**
   * Batches multiple updates together for efficient processing.
   * Updates are queued and processed together after the action completes.
   * @param action - The action to execute in batch mode
   */
  batch (action: Action): void {
    if (this.batching) {
      action()

      return
    }

    this.batching = true
    action()
    this.endBatching()
  }

  /**
   * Processes all queued updates and ends batch mode.
   * Flushes the update queue and notifies all affected slots.
   * @internal
   */
  endBatching (): void {
    if (!this.batching) return

    if (!this.queue.size) {
      this.batching = false

      return
    }

    const queue = this.queue

    let item: QueueItem<Slot> | undefined

    while ((item = queue.start)) {
      if (item.forced) {
        item.value.forceUpdate()
      } else {
        item.value.force()
      }
    }

    this.batching = false
  }

  /**
   * Destroys the hub and all its slots.
   * Cleans up all resources and resets the hub state.
   */
  destroy () {
    this.slots.forEach((slot) => {
      slot.destroy()
    })

    this.slots.clear()
    this.queue.clear()
    this.batching = false
    this.unwatching = false
    this.ctx = undefined
  }
}
