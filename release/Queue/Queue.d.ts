/**
 * A node in a doubly-linked queue.
 * Represents a single item that can be added to or removed from a queue.
 * @template T - The base type of values in the queue
 * @template T1 - The specific type of this item's value (extends T)
 */
export declare class QueueItem<T = unknown, T1 extends T = T> {
    value: T1;
    deque?: Queue<T> | undefined;
    prev?: QueueItem<T> | undefined;
    next?: QueueItem<T> | undefined;
    forced?: boolean | undefined;
    /**
     * Creates a new queue item.
     * @param value - The value stored in this item
     * @param deque - The queue this item belongs to
     * @param prev - The previous item in the queue
     * @param next - The next item in the queue
     * @param forced - Whether this is a forced/priority item
     */
    constructor(value: T1, deque?: Queue<T> | undefined, prev?: QueueItem<T> | undefined, next?: QueueItem<T> | undefined, forced?: boolean | undefined);
    /**
     * Removes this item from its queue.
     * Updates the queue's linked list structure and decrements the size.
     */
    abort(): void;
}
/**
 * A doubly-linked queue with support for priority (forced) items.
 * Forced items are inserted at the front of the queue for immediate processing.
 * @template T - The type of values stored in the queue
 */
export declare class Queue<T> {
    /** The first item in the queue (next to be processed) */
    start?: QueueItem<T>;
    /** The last forced (priority) item in the queue */
    forced?: QueueItem<T>;
    /** The last item in the queue */
    end?: QueueItem<T>;
    /** The number of items currently in the queue */
    size: number;
    /**
     * Adds a priority item to the queue.
     * Forced items are inserted after existing forced items but before regular items.
     * @template T1 - The specific type of the value (extends T)
     * @param value - The value to add
     * @returns The created queue item
     */
    force<T1 extends T>(value: T1): QueueItem<T, T1>;
    /**
     * Adds a regular item to the end of the queue.
     * @template T1 - The specific type of the value (extends T)
     * @param value - The value to add
     * @returns The created queue item
     */
    push<T1 extends T>(value: T1): QueueItem<T, T1>;
    /**
     * Removes all items from the queue.
     * Resets the queue to its initial empty state.
     */
    clear(): void;
}
