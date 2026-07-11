# RuneHub - Reactive State Engine

## Overview

RuneHub is a lightweight, high-performance reactive state management library for JavaScript/TypeScript applications.
It provides a simple yet powerful API for managing application state with automatic dependency tracking, computed values, and efficient update batching.

**Key Features:**
- 🚀 High performance with minimal overhead
- 📦 Small bundle size (~1.6KB minzip)
- 🔄 Automatic dependency tracking
- 🎯 Fine-grained reactivity
- 🔋 Built-in batching system
- 🎪 Event-driven architecture
- 🧩 Framework-agnostic
- 💪 TypeScript support

## Core Concepts

### Rune

A **Rune** is a function that returns a value.
It's the fundamental unit of state in RuneHub.

```typescript
type Rune<R = any> = () => R
```

Runes can be:
- **Primitive states**: Simple value containers
- **Computed states**: Derived from other runes
- **Effects**: Functions that perform side effects when dependencies change

```typescript
// Primitive rune
const count = () => 0

// Computed rune
const double = () => get(count) * 2

// Effect rune
const logger = () => console.log('Count:', get(count))
on(logger)  // Executes when count changes
```

#### Key Characteristics

**Lazy evaluation** — The function doesn't run until first access:

```typescript
const expensive = () => {
  console.log('Computing...')
  return heavyCalculation()
}

// Nothing logged yet — function not called

console.log(get(expensive))
// logs: Computing...
// returns result
```

**Automatic naming** — Function names are preserved for debugging:

```typescript
const count = () => 0
console.log(count.name)  // "count"
```

**Type inference** — TypeScript infers types from the function:

```typescript
const count = () => 0                 // Rune<number>
const name = () => 'Alice'            // Rune<string>
const items = () => [1, 2, 3]         // Rune<number[]>
const mixed = (): null | number => 1  // Rune<null | number>
```

#### Dynamic Dependencies

Computed runes automatically track only the runes they actually read:

```typescript
const showDetails = () => false
const name = () => 'Alice'
const age = () => 25

const display = () => {
  const result = get(name)
  
  if (get(showDetails)) {
    return `${result}, ${get(age)}`
  }
  
  return result
}

const log = () => console.log(get(display))

on(log)
// logs: Alice

set(age, 26)
// nothing — age isn't tracked because showDetails is false

set(showDetails, true)
// logs: Alice, 26

set(age, 27)
// logs: Alice, 27
// now age is tracked!
```

The dependency graph updates automatically based on which branches execute.

#### Runes are Keys

A rune doesn't hold state — it's a **key** to state. The actual value is stored in a [hub](#hub).

```typescript
const count = () => 0

// Same rune, different hubs, different values
set(count, 5)           // Global hub

customHub.use(() => {
  set(count, 100)       // Custom hub
})
```

### Slot

A **Slot** is a container that manages a rune's lifecycle, dependencies, and subscriptions.
It handles:
- Value caching
- Dependency tracking
- Subscription management
- Event dispatching
- Update batching

```typescript
class Slot<T> {
  cur?: T              // Current value
  prev?: T             // Previous value
  up: boolean          // Active state
  inited: boolean      // Initialization state
  deps: Set<Slot>      // Dependencies
  subs: Set<Slot>      // Subscribers
  events: Record<Event, Listener[]>  // Event listeners
}
```

#### Why Use Slot Directly?

**Performance** — Skip the slot lookup overhead (while Map lookup is O(1), direct slot access is faster):

```typescript
const count = () => 0

// With rune (Map lookup on every access)
get(count)  // looks up slot in hub.slots Map, then accesses value

// Direct slot (no lookup)
const countSlot = new Slot(count)
countSlot.value  // direct property access
```

**Familiar API** — If you're coming from SolidJS, Preact Signals, or following the TC39 Signals Proposal:

```typescript
// Similar to signals in other libraries
const count = new Slot(() => 0)

// Property access
count.value = 5
console.log(count.value)

// Or method calls
count.set(5)
console.log(count.get())
```

#### Slot API

**Properties:**

```typescript
slot.value       // Get or set the current value
slot.cur         // Current value (read-only, no subscription, no initialization)
slot.raw         // Current value (read-only, no subscription)
slot.prev        // Previous value (read-only)
slot.up          // Is slot active (has subscribers or activated via up parameter)
slot.inited      // Has slot been initialized
slot.deps        // Set<Slot> — dependencies
slot.subs        // Set<Slot> — subscribers
```

**Methods:**

```typescript
slot.on()                          // Activate slot for effects (returns destructor)
slot.on(event, listener, up?)      // Subscribe to specific event
slot.off()                         // Deactivate slot (remove from execution context)
slot.off(event, listener)          // Unsubscribe from event
slot.update()                      // Force notification (when mutating objects/arrays)
slot.destroy()                     // Cleanup and remove all subscriptions
```

### Hub

A **Hub** is a context manager that:
- Manages slot lifecycle
- Provides execution context
- Handles batching
- Maintains slot registry
- Controls dependency tracking

```typescript
class Hub {
  static root: Hub              // Global hub instance
  ctx: Slot | undefined         // Current execution context
  slots: Map<Rune, Slot>        // Slot registry
  queue: Queue<Slot>            // Update queue
  batching: boolean             // Batching state
  unwatching: boolean           // Dependency tracking state
}
```

#### Why Use Custom Hubs?

Custom hubs enable isolated reactive contexts where the same rune can have different values:

```typescript
import { Hub, get, set } from 'rune-hub'

const count = () => 0

// Global hub
set(count, 5)
console.log(get(count))  // 5

// Custom hub
const customHub = new Hub()

customHub.use(() => {
  console.log(get(count))  // 0 (fresh state!)
  set(count, 100)
  console.log(get(count))  // 100
})

// Back to global hub
console.log(get(count))  // still 5
```

#### Use Cases

**1. Server-side rendering** — Each request gets its own hub:

```typescript
// Define runes once
const userId = () => ''
const userName = () => `User ${get(userId)}`

app.get('/user/:id', (req, res) => {
  const requestHub = new Hub()
  
  requestHub.use(() => {
    // Same runes, isolated state per request
    set(userId, req.params.id)
    
    const html = renderApp()  // uses userName rune
    res.send(html)
  })
})
```

**2. Testing** — Each test gets a clean slate:

```typescript
// Define runes once (shared across tests)
const count = () => 0
const double = () => get(count) * 2

test('counter increments', () => {
  const testHub = new Hub()
  
  testHub.use(() => {
    set(count, 1)
    expect(get(count)).toBe(1)
    expect(get(double)).toBe(2)
  })
})

test('counter starts at zero', () => {
  const testHub = new Hub()
  
  testHub.use(() => {
    // Fresh state, not affected by previous test
    expect(get(count)).toBe(0)
    expect(get(double)).toBe(0)
  })
})
```

**3. Temporary state** — Try changes without affecting the main state:

```typescript
const price = () => 100
const discount = () => 0
const total = () => get(price) - get(discount)

// Main app
console.log(get(total))  // 100

// Try different scenarios in isolated hub
const whatIfHub = new Hub()

whatIfHub.use(() => {
  set(discount, 20)
  console.log('With 20% discount:', get(total))  // 80
  
  set(discount, 50)
  console.log('With 50% discount:', get(total))  // 50
})

// Main state unchanged
console.log(get(total))  // still 100
```

### Queue

A **Queue** manages the order of slot updates during batching:
- Priority queue for forced updates
- Regular queue for normal updates
- Efficient linked-list implementation

```typescript
class Queue<T> {
  start?: QueueItem<T>    // First item
  forced?: QueueItem<T>   // Last forced item
  end?: QueueItem<T>      // Last item
  size: number            // Queue size
}
```

## Architecture

### Dependency Tracking

RuneHub uses automatic dependency tracking:

1. When a rune is accessed via `get()`, it registers as a dependency
2. The current execution context (slot) subscribes to the accessed rune
3. When the rune's value changes, all subscribers are notified
4. Computed runes automatically recalculate when dependencies change

```typescript
const count = () => 0
const double = () => get(count) * 2  // Automatically tracks 'count'

on(() => {
  console.log(get(double))  // Logs: 2
})

set(count, 5)  // Triggers recalculation, logs: 10
```

### Update Flow

1. **Value Change**: `set()` updates a rune's value
2. **Queue**: Dependent slots are added to the update queue
3. **Batching**: Updates are batched if within a batch context
4. **Recalculation**: Slots recalculate their values
5. **Notification**: Subscribers are notified of changes
6. **Events**: Relevant events are triggered

### Memory Management

- Slots automatically unsubscribe when no longer needed
- Computed runes stop calculating when they have no subscribers
- Deep dependency chains are cleaned up automatically

## Effects

Effects are runes that perform side effects — logging, DOM updates, network requests, state mutations, or any operation beyond pure computation.
Effects are activated with the `on` hook and automatically re-run when their dependencies change.

### Basic Effects

Activate an effect by passing it to `on(effect)`. The effect runs immediately and subscribes to any runes accessed inside:

```typescript
const count = () => 0
const log = () => console.log('Count:', get(count))

on(log)
// logs: Count: 0

set(count, 5)
// logs: Count: 5
```

**Stopping an effect:**

`on()` returns a function to stop the effect:

```typescript
const stop = on(log)

set(count, 10)
// logs: Count: 10

stop()  // stop the effect

set(count, 15)
// nothing — effect stopped
```

You can also use the `off` hook:

```typescript
on(log)

set(count, 10)
// logs: Count: 10

off(log)  // stop the effect

set(count, 15)
// nothing — effect stopped
```

### Nested Effects

Effects can be nested. Nested effects subscribe to their own dependencies independently — changes to nested effect dependencies don't trigger the parent effect. When a parent effect re-runs, nested effects are automatically cleaned up:

```typescript
const count = () => 0
const message = () => ''

const logMessage = () => {
  console.log('Message:', get(message))
}

const logCount = () => {
  console.log('Count:', get(count))
  
  on(logMessage)
}

on(logCount)
// logs: Count: 0
// logs: Message: 

set(message, 'hello')
// logs: Message: hello

set(count, 1)
// logs: Count: 1
// logs: Message: hello

set(message, 'Hi')
// logs: Message: Hi
```

### Component-like Patterns

Nested effects enable component-like patterns where each effect acts as an isolated unit with its own lifecycle. Components mount when activated, run their setup logic, and automatically clean up when deactivated.

```typescript
const page = () => 'home'
const count = () => 0

// Counter render effect
const counter = () => {
  console.log(`Counter render: ${get(count)}`)
}

// Home component
const Home = () => {
  console.log('Home mounted')
  
  on(Home, 'clear', () => {
    console.log('Home unmounted')
  })
}

// Counter component
const Counter = () => {
  console.log('Counter mounted')
  
  on(counter)
  
  on(Counter, 'clear', () => {
    console.log('Counter unmounted')
  })
}

// App component with conditional rendering
const App = () => {
  if (get(page) === 'home') {
    on(Home)
  } else if (get(page) === 'counter') {
    on(Counter)
  }
}

on(App)
// logs: Home mounted

set(page, 'counter')
// logs: Home unmounted
// logs: Counter mounted
// logs: Counter render: 0

set(count, 5)
// logs: Counter render: 5

set(page, 'home')
// logs: Counter unmounted
// logs: Home mounted

set(count, 10)
// nothing — Counter is unmounted, no longer reacting
```

When the parent effect re-runs, it emits a `'clear'` event that triggers cleanup handlers and stops nested effects. This enables component-like patterns: conditional rendering, routing, modals, or any architecture where units of code need to mount and unmount automatically.

## API Reference

### Hooks

#### `get(rune)`

Reads a rune's value and establishes a dependency.

```typescript
function get<T extends Rune>(rune: T): ReturnType<T>
```

**Example:**
```typescript
const count = () => 0
const value = get(count)  // Returns 0, tracks dependency
```

#### `set(rune, value)`

Updates a rune's value.

```typescript
function set<T extends Rune>(rune: T, value: ReturnType<T>): void
```

**Example:**
```typescript
const count = () => 0
set(count, 5)  // Updates count to 5
```

#### `raw(rune)`

Reads a rune's value without establishing a dependency.

```typescript
function raw<T extends Rune>(rune: T): ReturnType<T>
```

**Example:**
```typescript
const count = () => 0
const value = raw(count)  // Returns 0, no dependency tracking
```

#### `on(rune)` / `on(rune, event, listener, up?, free?)`

Subscribes to a rune or its events.

```typescript
function on(rune: Rune): Destructor
function on(rune: Rune, event: Event, listener: Listener, up?: boolean, free?: boolean): Destructor
```

**Parameters:**
- `rune`: The rune to subscribe to
- `event`: (optional) Specific event to listen to
- `listener`: (optional) Event listener function
- `up`: (optional) Whether to activate the slot immediately
- `free`: (optional) If true, prevents automatic cleanup on 'clear' event

**Examples:**
```typescript
// Subscribe to rune (effect)
const unsubscribe = on(() => {
  console.log(get(count))
})

// Subscribe to specific event
on(count, 'change', () => {
  console.log('Count changed!')
}, true)

// Subscribe without automatic cleanup
on(count, 'change', () => {
  console.log('Manual cleanup required')
}, true, true)
```

#### `off(rune)` / `off(rune, event, listener)`

Unsubscribes from a rune or its events.

```typescript
function off(rune: Rune): void
function off(rune: Rune, event: Event, listener: Listener): void
```

**Example:**
```typescript
const listener = () => console.log('Changed!')
on(count, 'change', listener)
off(count, 'change', listener)
```

#### `update(rune)`

Forces an update notification for a rune (useful for mutable data).

```typescript
function update(rune: Rune): void
```

**Example:**
```typescript
const list = () => []
raw(list).push(1, 2, 3)
update(list)  // Notify subscribers of the change
```

#### `destroy(rune)`

Destroys a rune's slot and cleans up all subscriptions.

```typescript
function destroy(rune: Rune): void
```

**Example:**
```typescript
const count = () => 0
on(count)
destroy(count)  // Cleanup
```

#### `batch(action)`

Batches multiple updates into a single notification cycle.

```typescript
function batch(action: Action): void
```

**Example:**
```typescript
batch(() => {
  set(count1, 1)
  set(count2, 2)
  set(count3, 3)
})
// Subscribers notified once after all updates
```

#### `slot(rune)`

Gets or creates a slot for a rune.

```typescript
function slot<T extends Rune>(rune: T): Slot<ReturnType<T>>
```

**Example:**
```typescript
const count = () => 0
const countSlot = slot(count)
console.log(countSlot.raw)  // Access slot directly
```

#### `getSlot(rune)`

Gets an existing slot without creating one.

```typescript
function getSlot<T extends Rune>(rune: T): Slot<ReturnType<T>> | undefined
```

**Example:**
```typescript
const count = () => 0
const countSlot = getSlot(count)  // undefined if not created
```

#### `hub()`

Gets the current hub context.

```typescript
function hub(): Hub
```

**Example:**
```typescript
const currentHub = hub()
console.log(currentHub.batching)
```

#### `unwatch(action)`

Executes an action without tracking dependencies.

```typescript
function unwatch<A extends Fn<[]>>(action: A): ReturnType<A>
```

**Example:**
```typescript
const count1 = () => 0
const count2 = () => 0

const effect = () => {
  const value1 = get(count1)  // Tracked
  
  unwatch(() => {
    const value2 = get(count2)  // Not tracked
  })
}

on(effect)
// Effect will only re-run when count1 changes, not count2
```

## Events System

RuneHub provides a comprehensive event system for fine-grained control:

### Event Types

- **`init`**: Fired when a slot is first initialized
- **`call`**: Fired when a rune function is called
- **`update`**: Fired when a value is set (even if unchanged)
- **`change`**: Fired when a value actually changes
- **`clear`**: Fired before recalculation (cleanup phase)
- **`destroy`**: Fired when a slot is destroyed
- **`up`**: Fired when the first subscriber is added
- **`down`**: Fired when the last subscriber is removed

### Event Usage

```typescript
const count = () => 0

// Listen to initialization
on(count, 'init', () => {
  console.log('Count initialized')
})

// Listen to changes
on(count, 'change', () => {
  console.log('Count changed to:', raw(count))
}, true)  // 'true' activates the slot

// Cleanup pattern
const effect = () => {
  console.log('Setup')
  
  const cleanup = on(effect, 'clear', () => {
    console.log('Cleanup')
    cleanup()
  })
}
on(effect)
```

## Usage Examples

### Basic Counter

```typescript
import { get, set, on } from 'rune-hub'

const count = () => 0

// Subscribe to changes
on(() => {
  console.log('Count:', get(count))
})
// Output: Count: 0

set(count, 1)  // Output: Count: 1
set(count, 2)  // Output: Count: 2
```

### Computed Values

```typescript
const count = () => 0
const double = () => get(count) * 2
const quadruple = () => get(double) * 2

on(() => {
  console.log('Quadruple:', get(quadruple))
})
// Output: Quadruple: 0

set(count, 5)
// Output: Quadruple: 20
```

### Conditional Dependencies

```typescript
const streaming = () => true
const count = () => 0

on(() => {
  if (get(streaming)) {
    console.log('Count:', get(count))
  }
})
// Output: Count: 0

set(count, 1)  // Output: Count: 1
set(streaming, false)
set(count, 2)  // No output (not streaming)
```

### Batching Updates

```typescript
const count1 = () => 0
const count2 = () => 0
const sum = () => get(count1) + get(count2)

on(() => {
  console.log('Sum:', get(sum))
})
// Output: Sum: 0

batch(() => {
  set(count1, 5)
  set(count2, 10)
})
// Output: Sum: 15 (single notification)
```

### Mutable Data

```typescript
const items = () => []

on(() => {
  console.log('Items:', get(items))
})
// Output: Items: []

raw(items).push(1, 2, 3)
update(items)
// Output: Items: [1, 2, 3]
```

### Using Slot Directly

```typescript
import { Slot } from 'rune-hub'

const count = new Slot(() => 0)

count.on(() => {
  console.log('Count:', count.value)
})
// Output: Count: 0

count.value = 5
// Output: Count: 5

count.destroy()  // Cleanup
```

### Custom Hub Context

```typescript
import { Hub } from 'rune-hub'

const customHub = new Hub()

const count = () => 0

customHub.use(() => {
  on(() => {
    console.log('Count:', get(count))
  })
  
  set(count, 5)
})

customHub.destroy()  // Cleanup entire context
```

### Custom Slot Implementation

```typescript
import { Slot, RUNE_CAST } from 'rune-hub'

class LoggedSlot<T> extends Slot<T> {
  override set(value: T): void {
    console.log('Setting value:', value)
    super.set(value)
  }
}

const count = () => 0
count[RUNE_CAST] = (rune, hub) => new LoggedSlot(rune, hub, false)

set(count, 5)  // Output: Setting value: 5
```

## Performance

RuneHub is designed for high performance with competitive benchmarks against popular state management libraries.

### Performance Characteristics

Each library has different performance characteristics depending on the use case:

- **State creation** — Some libraries are faster at initializing new state containers
- **Subscription creation** — Some excel at adding new listeners/subscribers
- **Read operations** — Some optimize for frequent value access
- **Write operations** — Some optimize for frequent updates

**RuneHub's performance bottleneck:**

The main performance limitation in RuneHub comes from using `Map` and `Set` for dependency tracking and subscription management.
While these data structures provide O(1) algorithmic complexity for lookups and modifications, the actual runtime performance of `Map`/`Set` operations in current Node.js or Bun implementations is not yet optimized to match their theoretical efficiency.
This overhead affects operations like creating new reactive dependencies and managing subscriptions.

Despite this limitation, RuneHub achieves competitive benchmark results. As JavaScript runtimes continue to optimize `Map` and `Set` implementations, RuneHub's performance will improve automatically without requiring any code changes.

### Benchmark Results

RuneHub ships with benchmarks against **watch-state**, **MobX**, **Effector**, **Nano Stores**, **Jotai**, **Zustand**, and **Redux**.

These benchmarks provide a rough performance comparison rather than a complete real-world picture. Some scenarios may be simplified — for example, they don't account for spread operations or the presence of other state in the store. The goal was to stress-test RuneHub under challenging conditions to identify and optimize bottlenecks during development.

**Key findings:**

- **State creation**: RuneHub Rune is fastest (100%), competitive with watch-state
- **Subscriptions**: Redux and Nano Stores lead, RuneHub competitive for event subscriptions
- **Read operations**: Most libraries perform similarly, RuneHub within 70-96% of fastest
- **Write operations**: RuneHub Slot is fastest (100%), followed by watch-state
- **Batching**: RuneHub Slot event is fastest (100%), significantly ahead of competitors
- **Counter scenarios**: RuneHub competitive across different scales

For detailed benchmark tables and results, see the [Performance section in README](https://github.com/d8corp/rune-hub#performance).

### Running Benchmarks

To run the benchmarks on your own machine:

```shell
# Clone the repository
git clone https://github.com/d8corp/rune-hub.git
cd rune-hub

# Install dependencies
npm i

# Run the full benchmark suite
npm run speed:node      # Node.js
npm run speed:bun       # Bun
```

Or run focused scenarios:

```shell
npm run speed:node:init       # initialization
npm run speed:node:get        # reads
npm run speed:node:set        # writes
npm run speed:node:batching   # batched updates
npm run speed:node:examples   # end-to-end scenarios
```

### Optimization Strategies

1. **Automatic Cleanup**: Unused computed runes stop calculating
2. **Batching**: Multiple updates are processed in a single cycle
3. **Lazy Initialization**: Slots are created only when needed
4. **Efficient Queue**: Priority queue for optimal update order
5. **Minimal Overhead**: Small memory footprint per slot

### Best Practices

- Use `raw()` when you don't need dependency tracking
- Batch related updates with `batch()`
- Clean up subscriptions when no longer needed
- Use computed runes for derived state
- Leverage the event system for side effects

## Common Pitfalls

Here are common mistakes to avoid when using RuneHub.

### Dynamic Runes

**❌ Don't create runes dynamically without cleanup:**

```typescript
// BAD: Creates new rune on every call
function processUser(id) {
  const userName = () => `User ${id}`  // New rune each time!
  
  const log = () => {
    console.log(get(userName))
  }
  
  on(log)
}

// Each call leaks a rune
processUser(1)
processUser(2)
processUser(3)
```

Each call creates a new rune, but the old ones are never cleaned up. This causes memory leaks.

**✅ Define runes once, update values:**

```typescript
// GOOD: Reuse the same rune
const userId = () => 0
const userName = () => `User ${get(userId)}`

const logUserName = () => {
  console.log(get(userName))
}

on(logUserName)

function processUser(id) {
  set(userId, id)  // Update value, not rune
}

processUser(1)  // logs: User 1
processUser(2)  // logs: User 2
```

**✅ Or use cleanup if you must create dynamically:**

```typescript
// ACCEPTABLE: Clean up dynamic runes
function processUser(id) {
  const userName = () => `User ${id}`
  
  const log = () => {
    console.log(get(userName))
  }
  
  on(log)
  
  // Clean up when done
  return () => {
    destroy(log)
    destroy(userName)
  }
}

const cleanup = processUser(1)
// Later...
cleanup()
```

**✅ Or use a hub for isolated scope:**

```typescript
// BEST: Hub automatically cleans up everything
function processUser(id) {
  const userHub = new Hub()
  
  userHub.use(() => {
    const userName = () => `User ${id}`
    
    const log = () => {
      console.log(get(userName))
    }
    
    on(log)
  })
  
  // Clean up when done
  return () => {
    userHub.destroy()  // Cleans up all runes and effects at once
  }
}

const cleanup = processUser(1)
// Later...
cleanup()
```

### Mutating Without Update

**❌ Don't mutate objects/arrays without notifying:**

```typescript
const items = () => []

const log = () => {
  console.log('Items:', get(items))
}

on(log)

// BAD: Mutates but doesn't notify
raw(items).push(1, 2, 3)
// Effect doesn't re-run!
```

**✅ Call `update` after mutation:**

```typescript
const items = () => []

const log = () => {
  console.log('Items:', get(items))
}

on(log)

// GOOD: Notify after mutation
raw(items).push(1, 2, 3)
update(items)
// Effect re-runs
```

**✅ Or use immutable updates:**

```typescript
const items = () => []

const log = () => {
  console.log('Items:', get(items))
}

on(log)

// GOOD: Immutable update
set(items, [...get(items), 1, 2, 3])
// Effect re-runs
```

### Circular Dependencies

**❌ Don't create circular dependencies:**

```typescript
// BAD: a depends on b, b depends on a
const a = () => get(b) + 1
const b = () => get(a) + 1

console.log(get(a))  // Stack overflow!
```

**✅ Restructure to avoid cycles:**

```typescript
// GOOD: Linear dependency chain
const base = () => 0
const a = () => get(base) + 1
const b = () => get(a) + 1

console.log(get(b))  // Works fine
```

**⚠️ Self-updates are OK (with limits):**

```typescript
// ACCEPTABLE: Self-updating with termination condition
const count = () => 0

const increment = () => {
  const value = get(count)
  
  if (value < 3) {
    set(count, value + 1)  // Self-update
  }
}

on(increment)
// Stops at 3
```

## Casting

Casting allows you to customize how runes are converted into slots. By default, `Hub.cast()` creates a standard `Slot`, but you can override this behavior per-rune using the `setCast` helper.

### Custom Slot

Create a custom slot class by extending `Slot`:

```typescript
import { Slot, setCast, set } from 'rune-hub'

class LoggedSlot<T> extends Slot<T> {
  override set (value: T): void {
    console.log('setting', value)
    super.set(value)
  }
}

const count = () => 0
setCast(count, rune => new LoggedSlot(rune))

set(count, 5)  // logs: setting 5
```

### setCast Helper

The `setCast` function assigns a custom slot constructor to a rune:

```typescript
import { setCast, type Cast } from 'rune-hub'

const count = () => 0

const cast: Cast<number> = (rune, hub, anon) => new LoggedSlot(rune, hub, anon)

setCast(count, cast)
```

**Signature:**

```typescript
function setCast<T>(rune: Rune<T>, cast: Cast<T>): void

type Cast<T> = (rune: Rune<T>, hub?: Hub, anon?: boolean) => Slot<T>
```

**Alternative: Using RUNE_CAST symbol**

You can also assign the cast function directly to the rune:

```typescript
import { RUNE_CAST } from 'rune-hub'

const count = () => 0
count[RUNE_CAST] = (rune, hub, anon) => new LoggedSlot(rune, hub, anon)
```

## Advanced Features

### Automatic Cleanup

RuneHub provides automatic cleanup of subscriptions when dependencies change. When you subscribe to an event within an execution context, the subscription is automatically cleaned up when the context's 'clear' event fires:

```typescript
const count = () => 0

const effect = () => {
  console.log('Setup')
  
  // This subscription will be automatically cleaned up
  // when effect recalculates
  on(count, 'change', () => {
    console.log('Count changed')
  })
}

on(effect)
```

**Manual Cleanup:**
If you need to prevent automatic cleanup, use the `free` parameter:

```typescript
const count = () => 0

const effect = () => {
  // This subscription won't be automatically cleaned up
  const destroy = on(count, 'change', () => {
    console.log('Count changed')
  }, true, true)  // free = true
  
  // You must manually clean up in clear event
  on(effect, 'clear', destroy)
}

on(effect)
```

### Unwatching Dependencies

The `unwatch()` hook allows you to execute code without tracking dependencies:

```typescript
const count1 = () => 0
const count2 = () => 0

const effect = () => {
  const value1 = get(count1)  // Tracked
  
  unwatch(() => {
    const value2 = get(count2)  // Not tracked
  })
}

on(effect)
// Effect will only re-run when count1 changes, not count2
```

### Preventing Double Calls

RuneHub automatically prevents redundant updates:

```typescript
const count = () => 0
const value = () => 0

const addEffect = () => set(value, get(count) + 1)
const removeEffect = () => set(value, get(count) - 1)

on(addEffect)
on(removeEffect)

set(count, 1)
// 'value' is updated only once with the final result
```

### Self-Referencing Effects

```typescript
const count = () => 0

on(() => {
  const value = get(count)
  
  if (value < 3) {
    set(count, value + 1)
  }
})
// Safely handles self-updates
```

### Deep Dependency Chains

```typescript
const a = () => 1
const b = () => get(a) * 2
const c = () => get(b) * 2
const d = () => get(c) * 2

on(() => console.log(get(d)))
// Efficiently manages deep chains
```

### Unsubscribe Patterns

```typescript
// Pattern 1: Return value
const off = on(() => console.log(get(count)))
off()

// Pattern 2: Direct call
on(effect)
off(effect)

// Pattern 3: Event-specific
const listener = () => console.log('Changed')
on(count, 'change', listener)
off(count, 'change', listener)
```

## TypeScript Support

RuneHub is written in TypeScript and provides full type safety:

```typescript
import type { Rune, Slot, Hub, Event, Listener } from 'rune-hub'

// Typed rune
const count: Rune<number> = () => 0

// Typed slot
const countSlot: Slot<number> = new Slot(() => 0)

// Type inference
const double = () => get(count) * 2  // Inferred as Rune<number>
```

### Type Inference

Types are inferred directly from the rune's return value:

```typescript
const count = () => 0
// Rune<number>

const name = () => 'Alice'
// Rune<string>

const user = () => ({ name: 'Alice', age: 25 })
// Rune<{ name: string; age: number }>

const items = () => [1, 2, 3]
// Rune<number[]>
```

### Explicit Return Types

Add explicit return types when inference isn't enough:

```typescript
// Interface for complex objects
interface User {
  name: string
  age: number
  email?: string
}

const user = (): User => ({
  name: 'Alice',
  age: 25,
})

// Union types
const status = (): 'idle' | 'loading' | 'success' | 'error' => 'idle'
```

### Type Safety

TypeScript catches errors at compile time:

```typescript
const count = () => 0
const name = () => 'Alice'

// ✅ Type-safe operations
const value: number = get(count)
set(count, 5)
const doubled: number = get(count) * 2

// ❌ Type errors caught at compile time
set(count, 'string')
// Error: Argument of type 'string' is not assignable to parameter of type 'number'

const str: string = get(count)
// Error: Type 'number' is not assignable to type 'string'
```

### DRY Principle

RuneHub's architecture naturally follows the **Don't Repeat Yourself (DRY)** principle. When adding new state, you define it in **one place** — unlike many other state management libraries where you must duplicate definitions across interfaces and initial state.

**The problem with other libraries:**

In libraries like Zustand, TypeScript requires duplicating every state key in both the interface and the initial state:

```typescript
// ❌ Zustand — duplication required
interface Store {
  isOpen: boolean      // Define here
  open: () => void     // Define here
  close: () => void    // Define here
  toggle: () => void   // Define here
}

const useNavbarStore = create<Store>((set, get) => ({
  isOpen: false,       // Duplicate here
  open: () => set({ isOpen: true }),    // Duplicate here
  close: () => set({ isOpen: false }),  // Duplicate here
  toggle: () => set({ isOpen: !get().isOpen }), // Duplicate here
}))
```

The interface is mandatory to get type-safe access via `get()`, but it forces you to maintain two sources of truth. Adding a new field means updating both the interface and the initial state.

**RuneHub's solution:**

With RuneHub, each piece of state is defined **once** as a function. TypeScript automatically infers the type from the function's return value:

```typescript
// ✅ RuneHub — define once, use everywhere
const isOpen = () => false
const open = () => set(isOpen, true)
const close = () => set(isOpen, false)
const toggle = () => set(isOpen, !get(isOpen))
```

**Benefits:**

- **Single source of truth** — Each state is defined in exactly one place
- **Automatic type inference** — TypeScript knows the type from the function
- **Simpler code** — No interfaces to maintain, no duplication
- **Easier refactoring** — Change the initial value in one place, types update automatically
- **Better readability** — Less boilerplate, clearer intent

## License

MIT License - Copyright (c) 2026 Mike Lysikov

## Links

- **Creator**: [Mike Lysikov](http://github.com/d8corp)
- **Source Code**: [GitHub](https://github.com/d8corp/rune-hub)
- **Repository**: [npm](https://www.npmjs.com/package/rune-hub) • [npmx](https://npmx.dev/package/rune-hub)
- **Progenitor**: [watch-state](https://www.npmjs.com/package/watch-state)
- **Created for**: [@innet/dom](https://github.com/d8corp/innet-dom)
- **Frameworks**: [@rune-hub/react](https://github.com/d8corp/rune-hub-react)

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
