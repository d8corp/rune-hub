/**
 * A node in a doubly-linked queue.
 * Represents a single item that can be added to or removed from a queue.
 * @template T - The base type of values in the queue
 * @template T1 - The specific type of this item's value (extends T)
 */
export class QueueItem<T = unknown, T1 extends T = T> {
  /**
   * Creates a new queue item.
   * @param value - The value stored in this item
   * @param deque - The queue this item belongs to
   * @param prev - The previous item in the queue
   * @param next - The next item in the queue
   * @param forced - Whether this is a forced/priority item
   */
  constructor (
    public value: T1,
    public deque?: Queue<T>,
    public prev?: QueueItem<T>,
    public next?: QueueItem<T>,
    public forced?: boolean,
  ) {}

  /**
   * Removes this item from its queue.
   * Updates the queue's linked list structure and decrements the size.
   */
  abort () {
    const deque = this.deque

    if (!deque) return

    if (this.next) {
      this.next.prev = this.prev
    }

    if (this.prev) {
      this.prev.next = this.next
    }

    if (deque.start === this) {
      deque.start = this.next
    }

    if (deque.end === this) {
      deque.end = this.prev
    }

    if (deque.forced === this) {
      deque.forced = this.prev
    }

    deque.size--
    this.deque = undefined
  }
}

/**
 * A doubly-linked queue with support for priority (forced) items.
 * Forced items are inserted at the front of the queue for immediate processing.
 * @template T - The type of values stored in the queue
 */
export class Queue<T> {
  /** The first item in the queue (next to be processed) */
  start?: QueueItem<T>

  /** The last forced (priority) item in the queue */
  forced?: QueueItem<T>

  /** The last item in the queue */
  end?: QueueItem<T>

  /** The number of items currently in the queue */
  size: number = 0

  /**
   * Adds a priority item to the queue.
   * Forced items are inserted after existing forced items but before regular items.
   * @template T1 - The specific type of the value (extends T)
   * @param value - The value to add
   * @returns The created queue item
   */
  force <T1 extends T>(value: T1): QueueItem<T, T1> {
    this.size++

    if (!this.start) {
      return this.forced = this.start = this.end = new QueueItem(value, this, undefined, undefined, true)
    }

    if (!this.forced) {
      return this.forced = this.start = this.start.prev = new QueueItem(value, this, undefined, this.start, true)
    }

    const newItem = new QueueItem(value, this, this.forced, this.forced.next, true)

    if (this.forced.next) {
      this.forced.next.prev = newItem
    }

    this.forced.next = newItem

    if (this.end === this.forced) {
      this.end = newItem
    }

    return this.forced = newItem
  }

  /**
   * Adds a regular item to the end of the queue.
   * @template T1 - The specific type of the value (extends T)
   * @param value - The value to add
   * @returns The created queue item
   */
  push <T1 extends T>(value: T1): QueueItem<T, T1> {
    this.size++

    if (!this.end) {
      return this.start = this.end = new QueueItem(value, this)
    }

    return this.end = this.end.next = new QueueItem(value, this, this.end)
  }

  /**
   * Removes all items from the queue.
   * Resets the queue to its initial empty state.
   */
  clear () {
    this.forced = this.start = this.end = undefined
    this.size = 0
  }
}
