# AI Agent Guide for RuneHub

> This document provides essential context for AI assistants working with the RuneHub reactive state library.

## Core Concepts

### What is RuneHub?

RuneHub is a lightweight reactive state library where **state is just a function**:

```ts
const count = () => 0  // That's it — no imports, no constructors
```

### Key Principles

1. **Functions are keys, not containers** — The same rune in different hubs has different values
2. **Lazy by design** — Initial values compute only on first access
3. **Zero initialization cost** — Define hundreds of runes, pay only for what you use
4. **Automatic tracking** — Dependencies update automatically based on code execution paths

## Common Patterns

### Creating State

```ts
// State rune
const count = () => 0

// Computed rune
const double = () => get(count) * 2

// Effect rune
const log = () => console.log(get(count))
```

### Reading and Writing

```ts
import { get, set, raw } from 'rune-hub'

get(count)    // Read + subscribe
raw(count)    // Read without subscribing
set(count, 5) // Write
```

### Effects

```ts
import { on, off } from 'rune-hub'

const stop = on(() => {
  console.log(get(count))
})

stop()  // Unsubscribe
// or
off(log)  // Force stop
```

### Events

```ts
on(count, 'change', () => {
  console.log('Changed to:', raw(count))
})
```

## Critical Rules for AI Agents

### ❌ Don't: Create Dynamic Runes Without Cleanup

```ts
// BAD — Memory leak
function processUser(id: number) {
  const userName = () => `User ${id}`  // New rune each call!
  on(() => console.log(get(userName)))
}
```

### ✅ Do: Reuse Runes or Use Hubs

```ts
// GOOD — Reuse
const userId = () => 0
const userName = () => `User ${get(userId)}`

// OR use Hub for isolated scope
const userHub = new Hub()
userHub.use(() => {
  const userName = () => `User ${id}`
  on(() => console.log(get(userName)))
})
// Later: userHub.destroy()
```

### ❌ Don't: Mutate Without Notification

```ts
// BAD
raw(items).push(1, 2, 3)  // No notification!
```

### ✅ Do: Call update() or Use Immutable Updates

```ts
// GOOD
raw(items).push(1, 2, 3)
update(items)

// OR immutable
set(items, [...get(items), 1, 2, 3])
```

### ❌ Don't: Create Circular Dependencies

```ts
// BAD
const a = () => get(b) + 1
const b = () => get(a) + 1  // Stack overflow!
```

## TypeScript Guidelines

### Type Inference (Preferred)

```ts
const count = () => 0          // Rune<number>
const name = () => 'Alice'      // Rune<string>
```

### Explicit Types (When Needed)

```ts
interface User {
  name: string
  age: number
}

const user = (): User => ({ name: 'Alice', age: 25 })

// Union types
const status = (): 'idle' | 'loading' | 'error' => 'idle'
```

### Variable Type Annotation

```ts
const count: Rune<number> = () => 0
```

## API Reference

### Essential Hooks

- `get(rune)` — Read + subscribe
- `set(rune, value)` — Write
- `raw(rune)` — Read without subscribing
- `on(rune)` — Activate effect (returns destructor)
- `on(rune, event, listener)` — Subscribe to event
- `off(rune)` — Force stop effect
- `update(rune)` — Force notification after mutation
- `destroy(rune)` — Full cleanup
- `batch(action)` — Group multiple writes
- `unwatch(action)` — Disable tracking inside callback

### Slot API (Direct Access)

```ts
const slot = new Slot(() => 0)

// Properties
slot.value       // Get/set with subscription
slot.raw         // Get without subscription
slot.cur         // Current value (no init, no sub)
slot.prev        // Previous value
slot.up          // Has subscribers
slot.inited      // Is initialized

// Methods
slot.get()       // Same as slot.value
slot.set(value)  // Same as slot.value = value
slot.on()        // Activate effect
slot.off()       // Deactivate
slot.update()    // Force notification
slot.destroy()   // Cleanup
```

### Hub API

```ts
const hub = new Hub()

hub.use(() => {
  // Code runs in isolated context
  const count = () => 0
  set(count, 5)
  return get(count)  // Returned value
})

hub.destroy()  // Clean up all runes
```

### Events

- `init` — First computation finished
- `call` — Function invoked
- `update` — Value set (even if unchanged)
- `change` — Value actually changed
- `clear` — Before recomputation
- `destroy` — Being destroyed
- `up` — First subscriber gained
- `down` — Last subscriber lost
- `get` — Value accessed

## Code Generation Guidelines

### When Suggesting State Management

1. **Start simple** — Use runes directly, no unnecessary abstractions
2. **One rune per piece of state** — Don't group unless there's a reason
3. **Computed values are just functions** — No special syntax
4. **Effects need explicit activation** — Always call `on()`

### Example: Counter

```ts
import { get, set } from 'rune-hub'

// State
const count = () => 0

// Computed
const double = () => get(count) * 2

// Action
const increment = () => {
  set(count, get(count) + 1)
}

// Effect
const log = () => {
  console.log('Count:', get(count))
}
```

### Example: Complex State

```ts
interface Todo {
  id: string
  text: string
  done: boolean
}

// State
const todos = (): Todo[] => []

// Computed
const activeTodos = () => get(todos).filter(t => !t.done)
const completedCount = () => get(todos).length - get(activeTodos).length

// Actions
const addTodo = (text: string) => {
  set(todos, [
    ...get(todos),
    { id: crypto.randomUUID(), text, done: false }
  ])
}

const toggleTodo = (id: string) => {
  set(todos, get(todos).map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  ))
}
```

## Framework Integration

### React

```tsx
import { useRune } from '@rune-hub/react'

function Counter() {
  const value = useRune(count)
  
  return (
    <button onClick={increment}>
      Count: {value}
    </button>
  )
}
```

### Vanilla JS

```ts
on(() => {
  document.getElementById('counter')!.textContent = 
    `Count: ${get(count)}`
})
```

## Performance Considerations

- **Runes are fastest for creation** — Lazy initialization
- **Slots are faster for repeated access** — Skip Map lookup
- **Event subscriptions are faster than effects** — Less overhead
- **Batching improves multi-update scenarios** — Use `batch()`

```ts
// Better performance with batch
batch(() => {
  set(firstName, 'John')
  set(lastName, 'Doe')
  set(age, 30)
})
// Subscribers notified once
```

## Testing Patterns

### Isolated Tests with Hubs

```ts
test('counter increments', () => {
  const testHub = new Hub()
  
  testHub.use(() => {
    set(count, 0)
    increment()
    expect(get(count)).toBe(1)
  })
})
```

### Testing Effects

```ts
test('effect runs on change', () => {
  const calls: number[] = []
  
  on(() => {
    calls.push(get(count))
  })
  
  set(count, 1)
  set(count, 2)
  
  expect(calls).toEqual([0, 1, 2])
})
```

## Common Mistakes to Avoid

1. **Creating runes inside loops** — Define once, reuse
2. **Forgetting to activate effects** — Always call `on()`
3. **Mutating without update** — Call `update()` or use immutability
4. **Circular dependencies** — Design linear dependency chains
5. **Using `get()` outside reactive context** — Use `raw()` for non-reactive reads

## When to Use What

- **Rune** — Default choice, lazy, automatic naming
- **Slot** — Need direct access, performance-critical paths
- **Hub** — SSR, testing, isolated contexts
- **Event subscriptions** — Fine-grained control over updates
- **Effects** — Side effects that depend on multiple runes

## Version Information

- **Current version**: Check package.json
- **TypeScript**: 5.9.3+
- **Zero dependencies**
- **Size**: ~1.5 KB minified + gzipped

## Additional Resources

- **Creator**: [Mike Lysikov](http://github.com/d8corp)
- **Source Code**: [GitHub](https://github.com/d8corp/rune-hub)
- **Repository**: [npm](https://www.npmjs.com/package/rune-hub) • [npmx](https://npmx.dev/package/rune-hub)
- **Progenitor**: [watch-state](https://www.npmjs.com/package/watch-state)
- **Frameworks**: [@rune-hub/react](https://github.com/d8corp/rune-hub-react)
- **Utils**: [@rune-hub/utils](https://github.com/d8corp/rune-hub-utils)

---

*Last updated: 2026-07-13*
