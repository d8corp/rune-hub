import { Queue, QueueItem } from './Queue'

describe('Queue', () => {
  describe('QueueItem', () => {
    it('Should create a queue item', () => {
      const item = new QueueItem(42)

      expect(item.value).toBe(42)
      expect(item.deque).toBeUndefined()
      expect(item.prev).toBeUndefined()
      expect(item.next).toBeUndefined()
      expect(item.forced).toBeUndefined()
    })

    it('Should abort item without deque', () => {
      const item = new QueueItem(42)

      expect(() => item.abort()).not.toThrow()
      expect(item.deque).toBeUndefined()
    })

    it('Should abort item from queue', () => {
      const queue = new Queue<number>()
      const item1 = queue.push(1)
      const item2 = queue.push(2)
      const item3 = queue.push(3)

      expect(queue.size).toBe(3)
      expect(queue.start).toBe(item1)
      expect(queue.end).toBe(item3)

      item2.abort()

      expect(queue.size).toBe(2)
      expect(item1.next).toBe(item3)
      expect(item3.prev).toBe(item1)
      expect(item2.deque).toBeUndefined()
    })

    it('Should abort start item from queue', () => {
      const queue = new Queue<number>()
      const item1 = queue.push(1)
      const item2 = queue.push(2)

      expect(queue.size).toBe(2)
      expect(queue.start).toBe(item1)

      item1.abort()

      expect(queue.size).toBe(1)
      expect(queue.start).toBe(item2)
      expect(item2.prev).toBeUndefined()
      expect(item1.deque).toBeUndefined()
    })

    it('Should abort end item from queue', () => {
      const queue = new Queue<number>()
      const item1 = queue.push(1)
      const item2 = queue.push(2)

      expect(queue.size).toBe(2)
      expect(queue.end).toBe(item2)

      item2.abort()

      expect(queue.size).toBe(1)
      expect(queue.end).toBe(item1)
      expect(item1.next).toBeUndefined()
      expect(item2.deque).toBeUndefined()
    })

    it('Should abort forced item from queue', () => {
      const queue = new Queue<number>()
      const item1 = queue.force(1)
      const item2 = queue.force(2)

      expect(queue.size).toBe(2)
      expect(queue.forced).toBe(item2)

      item2.abort()

      expect(queue.size).toBe(1)
      expect(queue.forced).toBe(item1)
      expect(item1.next).toBeUndefined()
      expect(item2.deque).toBeUndefined()
    })
  })

  describe('Queue', () => {
    it('Should create empty queue', () => {
      const queue = new Queue<number>()

      expect(queue.size).toBe(0)
      expect(queue.start).toBeUndefined()
      expect(queue.end).toBeUndefined()
      expect(queue.forced).toBeUndefined()
    })

    it('Should push items to queue', () => {
      const queue = new Queue<number>()
      const item1 = queue.push(1)
      const item2 = queue.push(2)

      expect(queue.size).toBe(2)
      expect(queue.start).toBe(item1)
      expect(queue.end).toBe(item2)
      expect(item1.next).toBe(item2)
      expect(item2.prev).toBe(item1)
    })

    it('Should force items to queue', () => {
      const queue = new Queue<number>()
      const item1 = queue.force(1)
      const item2 = queue.force(2)

      expect(queue.size).toBe(2)
      expect(queue.start).toBe(item1)
      expect(queue.forced).toBe(item2)
      expect(item1.next).toBe(item2)
      expect(item2.prev).toBe(item1)
      expect(item1.forced).toBe(true)
      expect(item2.forced).toBe(true)
    })

    it('Should force item before regular items', () => {
      const queue = new Queue<number>()
      const item1 = queue.push(1)
      const item2 = queue.force(2)

      expect(queue.size).toBe(2)
      expect(queue.start).toBe(item2)
      expect(queue.forced).toBe(item2)
      expect(queue.end).toBe(item1)
      expect(item2.next).toBe(item1)
      expect(item1.prev).toBe(item2)
    })

    it('Should force multiple items and keep order', () => {
      const queue = new Queue<number>()
      const item1 = queue.force(1)
      const item2 = queue.force(2)
      const item3 = queue.force(3)

      expect(queue.size).toBe(3)
      expect(queue.start).toBe(item1)
      expect(queue.forced).toBe(item3)
      expect(queue.end).toBe(item3)
      expect(item1.next).toBe(item2)
      expect(item2.next).toBe(item3)
      expect(item3.prev).toBe(item2)
    })

    it('Should force item between forced and regular items', () => {
      const queue = new Queue<number>()
      const item1 = queue.force(1)
      const item2 = queue.push(2)
      const item3 = queue.force(3)

      expect(queue.size).toBe(3)
      expect(queue.start).toBe(item1)
      expect(queue.forced).toBe(item3)
      expect(queue.end).toBe(item2)
      expect(item1.next).toBe(item3)
      expect(item3.next).toBe(item2)
      expect(item3.prev).toBe(item1)
      expect(item2.prev).toBe(item3)
    })

    it('Should clear queue', () => {
      const queue = new Queue<number>()
      queue.push(1)
      queue.push(2)
      queue.force(3)

      expect(queue.size).toBe(3)

      queue.clear()

      expect(queue.size).toBe(0)
      expect(queue.start).toBeUndefined()
      expect(queue.end).toBeUndefined()
      expect(queue.forced).toBeUndefined()
    })
  })
})
