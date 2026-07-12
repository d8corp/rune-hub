<h1 align="center">
<img src="https://raw.githubusercontent.com/d8corp/rune-hub/v1.0.0/logo.svg" width="80">
<br>
RuneHub
</h1>

<p align="center"><b>What if reactive state was just... functions?</b></p>

<div align="center">
  <a href="https://www.npmjs.com/package/rune-hub" target="_blank">
    <img src="https://img.shields.io/npm/v/rune-hub.svg" alt="rune-hub npm">
  </a>
  <a href="https://www.npmtrends.com/rune-hub" target="_blank">
    <img src="https://img.shields.io/npm/dm/rune-hub.svg" alt="rune-hub downloads">
  </a>
  <a href="https://github.com/d8corp/rune-hub/tree/main/release" target="_blank">
    <img src="https://packagephobia.com/badge?p=rune-hub" alt="rune-hub install size">
  </a>
  <a href="https://cdn.jsdelivr.net/npm/rune-hub" target="_blank">
    <img src="https://img.badgesize.io/https:/cdn.jsdelivr.net/npm/rune-hub?compression=gzip" alt="rune-hub gzip size">
  </a>
  <a href="https://www.typescriptlang.org" target="_blank">
    <img src="https://img.shields.io/npm/types/rune-hub" alt="TypeScript">
  </a>
  <a href="https://github.com/d8corp/rune-hub/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/npm/l/rune-hub" alt="rune-hub license">
  </a>
  <a href="https://github.com/d8corp/rune-hub/blob/main/CHANGELOG.md" target="_blank">
    <img src="https://img.shields.io/badge/Changelog-⋮-brightgreen" alt="rune-hub changelog">
  </a>
</div>
<br>

**RuneHub** is a lightweight, high-performance, and powerful reactive state library where **the state is just a function** that returns the initial value.

✨ **Simple** — No special constructors, no imports to create state.

```ts
const count = () => 0
```

✨ **Lazy evaluation** — Initial values are **not computed until first access**.

```ts
const config = () => JSON.parse(localStorage.getItem('config'))

// Nothing executed yet — zero cost to define
```

✨ **Auto-naming** — Function names are preserved automatically for debugging.

```ts
const count = () => 0
console.log(count.name)  // "count" — automatic, zero runtime cost
```

Compare with other libraries — all require imports and manual debugger names:

**SolidJS**:
```ts
import { createSignal } from 'solid-js'

const [count, setCount] = createSignal(0, { name: "count" })
```

**Preact Signals**:
```ts
import { signal } from '@preact/signals-core'

const count = signal(0, { name: "count" })
```

**MobX**:
```ts
import { observable } from 'mobx'

const count = observable.box(0, { name: "count" })
```

**Jotai**:
```ts
import { atom } from 'jotai'

const countAtom = atom(0)
if (process.env.NODE_ENV !== 'production') {
  countAtom.debugLabel = 'count'
}
```

**RuneHub**:
```ts
const count = () => 0
```

### What you get

- **Zero initialization cost** — Define hundreds of runes, pay only for what you use
- **Lazy by design** — Computes only when accessed and only when dependencies change
- **Debug-friendly** — Function names preserved automatically, no manual labeling or build plugins
- **Simple API** — One interface for state, computed, and effects
- **No Proxy** — Supports old browsers
- **Fast** — Competitive with the fastest reactive libraries ([benchmarks](#performance))
- **Tiny** — 1.5 KB minzip full
- **Zero dependencies** — No external packages
- **Automatic tracking** — Dependencies and subscriptions managed for you
- **Dynamic effects** — Conditional logic automatically updates dependency graph
- **Built-in batching** — Multiple updates collapse into one notification
- **Advanced event system** — Fine-grained lifecycle events for precise control
- **Isolated contexts** — Create separate reactive scopes ([hubs](#hub)) when needed
- **Type-safe** — Full TypeScript support with type inference
- **Framework-agnostic** — Works anywhere JavaScript runs

[![stars](https://img.shields.io/github/stars/d8corp/rune-hub?style=social)](https://github.com/d8corp/rune-hub/stargazers)
[![watchers](https://img.shields.io/github/watchers/d8corp/rune-hub?style=social)](https://github.com/d8corp/rune-hub/watchers)

## Index

<sup>**[ [Install](#install) ]**</sup>  
<sup>**[ [Usage](#usage) ]** [Example Vanilla JS](#example-vanilla-js) • [Example React](#example-react)</sup>  
<sup>**[ [Rune](#rune) ]** [Types of runes](#types-of-runes) • [Dynamic dependencies](#dynamic-dependencies) • [Runes are keys](#runes-are-keys)</sup>  
<sup>**[ [Hub](#hub) ]** [Why use custom hubs?](#why-use-custom-hubs) • [Use cases](#use-cases)</sup>  
<sup>**[ [Effects](#effects) ]** [Basic effects](#basic-effects) • [Nested effects](#nested-effects)</sup>  
<sup>**[ [Events](#events) ]** [Event types](#event-types) • [Unsubscribe](#unsubscribe)</sup>  
<sup>**[ [Slot](#slot) ]** [Why use Slot directly?](#why-use-slot-directly) • [Basic usage](#basic-usage) • [Computed slots](#computed-slots) • [Slot API](#slot-api) • [Custom slots](#custom-slots)</sup>   
<sup>**[ [Hooks](#hooks) ]** [get](#get) • [set](#set) • [raw](#raw) • [on](#on) • [off](#off) • [update](#update) • [destroy](#destroy) • [batch](#batch) • [unwatch](#unwatch) • [slot](#slot-hook) • [getSlot](#getslot) • [hub](#hub-hook)</sup>  
<sup>**[ [Common Pitfalls](#common-pitfalls) ]** [Dynamic runes](#dynamic-runes) • [Mutating without update](#mutating-without-update) • [Circular dependencies](#circular-dependencies)</sup>  
<sup>**[ [TypeScript](#typescript) ]** [Type inference](#type-inference) • [Explicit return types](#explicit-return-types) • [Explicit variable types](#explicit-variable-types) • [Type safety](#type-safety) • [DRY Principle](#dry-principle)</sup>  
<sup>**[ [Performance](#performance) ]**</sup>  
<sup>**[ [Links](#links) ]**</sup>


## Install
###### [🏠︎](#index) / Install [↓](#usage)

Get started with RuneHub using your preferred package manager:

npm
```shell
npm i rune-hub
```

yarn
```shell
yarn add rune-hub
```

pnpm
```shell
pnpm add rune-hub
```

Or use it directly in the browser via CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/rune-hub"></script>
```

## Usage
###### [🏠︎](#index) / Usage [↑](#install) [↓](#rune)

<sup>[Vanilla JS](#example-vanilla-js) • [React](#example-react)</sup>

RuneHub works in any JavaScript environment — Node.js, browsers, Deno, Bun. No build tools required, though TypeScript is fully supported.

Import hooks from the package depending on your module system:

```ts
// ES modules
import { get, set } from 'rune-hub'

// CommonJS
const { get, set } = require('rune-hub')

// Browser (via CDN)
const { get, set } = RuneHub
```

Create state, computed values, effects and actions the same way — just functions:

```ts
import { get, set, on } from 'rune-hub'

// State
const count = () => 0

// Computed State
const double = () => get(count) * 2

// Side Effect
const log = () => console.log(get(double))

// Actions
const increase = () => set(count, get(count) + 1)
```

### Example Vanilla JS
###### [🏠︎](#index) / [Usage](#usage) / Vanilla JS [↓](#example-react)

A reactive counter with no build step or framework:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Counter</title>
  <script src="https://cdn.jsdelivr.net/npm/rune-hub"></script>
  <script type="module">
    const { get, set, on } = RuneHub

    const count = () => 0
    const increase = () => set(count, get(count) + 1)

    const button = document.getElementById('counter')
 
    button.addEventListener('click', increase)
    
    on(() => {
      button.innerText = `Count: ${get(count)}`
    })
  </script>
</head>
<body>
  <button id="counter">Count: 0</button>
</body>
</html>
```

### Example React
###### [🏠︎](#index) / [Usage](#usage) / React [↑](#example-vanilla-js)

A reactive counter in React:

```tsx
import { set, get } from 'rune-hub'
import { useRune } from '@rune-hub/react'

const count = () => 0
const increase = () => set(count, get(count) + 1)

export function Counter() {
  const value = useRune(count)

  return (
    <button onClick={increase}>
      Count: {value}
    </button>
  )
}
```

## Rune
###### [🏠︎](#index) / Rune [↑](#usage) [↓](#hub)

<sup>[Types of runes](#types-of-runes) • [Dynamic dependencies](#dynamic-dependencies) • [Runes are keys](#runes-are-keys)</sup>

A **Rune** is a function that takes no arguments. Functions that expect arguments are not runes.

```ts
type Rune<R = any> = () => R
```

### Types of runes
###### [🏠︎](#index) / [Rune](#rune) / Types of runes [↓](#dynamic-dependencies)

The same shape `() => value` serves three roles:

**1. State rune** — holds a value:

```ts
const count = () => 0
const name = () => 'Alice'
const items = () => []
```

**2. Computed rune** — derives from other runes:

```ts
const count = () => 0
const double = () => get(count) * 2
const quadruple = () => get(double) * 2
```

**3. Effect rune** — performs side effects:

```ts
const logger = () => console.log('Count:', get(count))
on(logger)  // Runs when count changes
```

The role is determined by **how you use the rune**, not by which constructor you called.

### Dynamic dependencies
###### [🏠︎](#index) / [Rune](#rune) / Dynamic dependencies [↑](#types-of-runes) [↓](#runes-are-keys)

Computed runes automatically track only the runes they actually read:

```ts
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

### Runes are keys
###### [🏠︎](#index) / [Rune](#rune) / Runes are keys [↑](#dynamic-dependencies)

A rune doesn't hold state — it's a **key** to state. The actual value is stored in a [hub](#hub).
The same rune in different hubs has different values.

```ts
const count = () => 0

set(count, 5)
// Set 5 for the count in global hub

console.log(get(count))
// logs: 5

customHub.use(() => {
  console.log(get(count))
  // logs: 0 (initial value)
})
```

## Hub
###### [🏠︎](#index) / Hub [↑](#rune) [↓](#effects)

<sup>[Why use custom hubs?](#why-use-custom-hubs) • [Use cases](#use-cases)</sup>

A **Hub** is a reactive context that manages runes. By default, RuneHub uses a global hub (`Hub.root`), but you can create isolated hubs for advanced use cases.

### Why use custom hubs?
###### [🏠︎](#index) / [Hub](#hub) / Why use custom hubs? [↓](#use-cases)

Custom hubs enable isolated reactive contexts where the same rune can have different values:

```ts
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

// Back to custom hub
customHub.use(() => {
  console.log(get(count))  // still 100
})
```

### Use cases
###### [🏠︎](#index) / [Hub](#hub) / Use cases [↑](#why-use-custom-hubs)

**1. Server-side rendering** — Each request gets its own hub:

```ts
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

```ts
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

```ts
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

The `use` method returns the return value of the function passed to it.
```ts
const price = () => 100
const discount = () => 0
const total = () => get(price) - get(discount)

const whatIfHub = new Hub()

const whatIfTotal = whatIfHub.use(() => {
  set(discount, 20)

  return get(total)
})

console.log(whatIfTotal) // 80
console.log(get(total))  // still 100
```

## Effects
###### [🏠︎](#index) / Effects [↑](#hub) [↓](#events)

<sup>[Basic effects](#basic-effects) • [Nested effects](#nested-effects)</sup>

Effects are runes that perform side effects — logging, DOM updates, network requests, state mutations, or any operation beyond pure computation.

### Basic effects
###### [🏠︎](#index) / [Effects](#effects) / Basic effects [↓](#nested-effects)

Activate an effect by passing it to [`on`](#on). The effect runs immediately and subscribes to any runes accessed inside:

```ts
const count = () => 0
const log = () => console.log('Count:', get(count))

on(log)
// logs: Count: 0

set(count, 5)
// logs: Count: 5
```

**Stopping an effect**

[`on()`](#on) returns a function to stop the effect:

```ts
const stop = on(log)

set(count, 10)
// logs: Count: 10

stop()  // stop the effect

set(count, 15)
// nothing — effect stopped
```

**Multiple effect activation**

When calling `on` for an effect multiple times, you need to call all returned destructors to stop the effect:

```ts
const stop1 = on(log)
const stop2 = on(log)

stop1()

set(count, 10)
// logs: Count: 10

stop2()

set(count, 15)
// nothing — effect stopped
```

**Complete effect stop**

You can also use the [`off`](#off) hook to force stop the effect:

```ts
on(log)

set(count, 10)
// logs: Count: 10

off(log)  // stop the effect

set(count, 15)
// nothing — effect stopped
```

### Nested effects
###### [🏠︎](#index) / [Effects](#effects) / Nested effects [↑](#basic-effects) [↓](#component-like-patterns)

If an effect runs inside another effect, it runs as a nested effect.
Nested effects subscribe to their own dependencies independently — changes to nested effect dependencies don't trigger the parent effect.
When a parent effect re-runs, nested effects are automatically cleaned up:

```ts
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

## Events
###### [🏠︎](#index) / Events [↑](#effects) [↓](#slot)

<sup>[Event types](#event-types) • [Unsubscribe](#unsubscribe)</sup>

RuneHub provides a fine-grained event system for runes. Subscribe to specific lifecycle events using [`on(rune, event, listener)`](#on).

### Event types
###### [🏠︎](#index) / [Events](#events) / Event types [↓](#unsubscribe)

| Event     | Fired when                                           |
|-----------|------------------------------------------------------|
| `init`    | the rune has finished its first computation          |
| `call`    | the rune function has just been invoked              |
| `update`  | a value has been set (even if equal to the previous) |
| `change`  | the value actually changed (`prev !== cur`)          |
| `clear`   | before recomputation — used for cleanup              |
| `destroy` | the rune is being destroyed                          |
| `up`      | the rune gained its first subscriber                 |
| `down`    | the rune lost its last subscriber                    |
| `get`     | fired when a rune's value is accessed                |

```ts
const count = () => 0

on(count, 'init',    () => console.log('initialized'))
on(count, 'change',  () => console.log('changed to', raw(count)))
on(count, 'destroy', () => console.log('destroyed'))
```

### Unsubscribe
###### [🏠︎](#index) / [Events](#events) / Unsubscribe [↑](#event-types) [↓](#up-parameter)

All event subscriptions return a function that removes the subscription:

```ts
const count = () => 0
const listener = () => console.log('changed')

// Subscribe to event
const stop = on(count, 'change', listener)

// Unsubscribe
stop()
```

**Using the [`off`](#off) hook:**

You can also use the [`off`](#off) hook to remove event subscriptions:

```ts
const count = () => 0
const listener = () => console.log('changed')

// Subscribe
on(count, 'change', listener)

// Unsubscribe using off hook
off(count, 'change', listener)
```

## Slot
###### [🏠︎](#index) / Slot [↑](#events) [↓](#hooks)

<sup>[Why use Slot directly?](#why-use-slot-directly) • [Basic usage](#basic-usage) • [Computed slots](#computed-slots) • [Slot API](#slot-api) • [Custom slots](#custom-slots)</sup>

Behind every rune is a **Slot** — the actual reactive container. Runes provide a functional API with lazy initialization and automatic naming, but you can work with slots directly for maximum performance or when you want an API similar to signals in other libraries.

### Why use Slot directly?
###### [🏠︎](#index) / [Slot](#slot) / Why use Slot directly? [↓](#basic-usage)

**Performance** — Skip the slot lookup overhead (while Map lookup is O(1), direct slot access is faster as it skips the lookup entirely):

```ts
const count = () => 0

// With rune (Map lookup on every access)
get(count)  // looks up slot in hub.slots Map, then accesses value

// Direct slot (no lookup)
const countSlot = new Slot(count)
countSlot.value  // direct property access
```

**Familiar API** — If you're coming from SolidJS, Preact Signals, or following the [TC39 Signals Proposal](https://github.com/tc39/proposal-signals):

```ts
// Similar to signals in other libraries and the TC39 proposal
const count = new Slot(() => 0)

// Property access
count.value = 5
console.log(count.value)

// Or method calls
count.set(5)
console.log(count.get())
```

**No Hub registration** — Slots created with the global hub are anonymous by default (not registered in the hub's Map):

```ts
const count = () => 0  // rune

// Anonymous slot (default with global hub)
new Slot(count)  // anon = true, not registered

// Registered slot (explicit)
new Slot(count, Hub.root, false)  // anon = false, registered in Hub.root.slots

// Custom hub slots are registered by default
const customHub = new Hub()
new Slot(count, customHub)  // anon = false, registered in customHub.slots

// Anonymous slots skip Map operations entirely for maximum performance
```

### Basic usage
###### [🏠︎](#index) / [Slot](#slot) / Basic usage [↑](#why-use-slot-directly) [↓](#computed-slots)

**Creating a slot:**

```ts
import { Slot } from 'rune-hub'

const count = new Slot(() => 0)
```

The function provides the initial value. It's called lazily on first access.

**Reading and writing:**

```ts
console.log(count.value)  // 0

count.value = 5
console.log(count.value)  // 5
```

**Subscribing to changes:**

```ts
count.on('change', () => {
  console.log('Count:', count.value)
})

count.value = 10
// logs: Count: 10
```

**Unsubscribing:**

All event subscriptions return a function that removes the subscription:

```ts
const listener = () => console.log('Count:', count.value)

// Subscribe to event
const stop = count.on('change', listener)

// Unsubscribe
stop()
```

**Using the `off` method:**

You can also use the `off` method to remove event subscriptions:

```ts
const listener = () => console.log('Count:', count.value)

count.on('change', listener)

count.off('change', listener)  // stop listening
```

### Computed slots
###### [🏠︎](#index) / [Slot](#slot) / Computed slots [↑](#basic-usage) [↓](#slot-api)

Computed slots automatically track dependencies:

```ts
const count = new Slot(() => 0)
const double = new Slot(() => count.value * 2)

double.on('change', () => {
  console.log('Double:', double.value)
})

double.on() // to activate

count.value = 5
// logs: Double: 10
```

Dependencies are tracked when you access `.value` or `.get()` inside the rune passed to the slot's constructor.

**Conditional dependencies:**

```ts
const showDetails = new Slot(() => false)
const name = new Slot(() => 'Alice')
const age = new Slot(() => 25)

const display = new Slot(() => {
  const result = name.value
  
  if (showDetails.value) {
    return `${result}, ${age.value}`
  }
  
  return result
})

// Effect slot — performs side effects when dependencies change
const log = new Slot(() => {
  console.log(display.value)
})

log.on()  // Activate the effect
// logs: Alice

age.value = 26
// nothing — age not tracked

showDetails.value = true
// logs: Alice, 26

age.value = 27
// logs: Alice, 27 — now age is tracked

log.off()
// Stop logging
```

### Slot API
###### [🏠︎](#index) / [Slot](#slot) / Slot API [↑](#computed-slots) [↓](#custom-slots)

**Properties:**

```ts
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

```ts
slot.on()                          // Activate slot for effects (returns destructor)
slot.on(event, listener)           // Subscribe to specific event
slot.off()                         // Deactivate slot (remove from execution context)
slot.off(event, listener)          // Unsubscribe from event
slot.update()                      // Force notification (when mutating objects/arrays)
slot.destroy()                     // Cleanup and remove all subscriptions
```

**Events:**

Slots support the same [event system](#events) as runes:

```ts
slot.on('change', () => {
  console.log('Changed to:', slot.value)
})

slot.on('destroy', () => {
  console.log('Slot destroyed')
})
```

### Custom slots
###### [🏠︎](#index) / [Slot](#slot) / Custom slots [↑](#slot-api)

Extend `Slot` to add custom behavior:

```ts
import { Slot } from 'rune-hub'

class LoggedSlot<T> extends Slot<T> {
  override set(value: T): void {
    console.log(`[${this.rune.name}] ${this.cur} → ${value}`)
    super.set(value)
  }
}

const count = () => 0
const countSlot = new LoggedSlot(count)

countSlot.value = 5
// logs: [count] undefined → 5

countSlot.value = 10
// logs: [count] 5 → 10
```

**Debounced slot:**

```ts
import { Slot, Hub } from 'rune-hub'

class DebouncedSlot<T> extends Slot<T> {
  private timeout?: ReturnType<typeof setTimeout>
  
  constructor(
    rune: () => T,
    private delay: number,
    hub?: Hub,
    anon?: boolean
  ) {
    super(rune, hub, anon)
  }
  
  override set(value: T): void {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      super.set(value)
    }, this.delay)
  }
}

const search = new DebouncedSlot(() => '', 300)

const log = new Slot(() => {
  console.log('Search:', search.value)
})

log.on()

search.value = 'a'
search.value = 'ab'
search.value = 'abc'
// logs: Search: abc (after 300ms, only once)
```

## Hooks
###### [🏠︎](#index) / Hooks [↑](#slot) [↓](#common-pitfalls)

<sup>[get](#get) • [set](#set) • [raw](#raw) • [on](#on) • [off](#off) • [update](#update) • [destroy](#destroy) • [batch](#batch) • [unwatch](#unwatch) • [slot](#slot-hook) • [getSlot](#getslot) • [hub](#hub-hook)</sup>

Hooks are the functions you import from `rune-hub` to interact with runes.
They provide the API for reading, writing, subscribing, and managing reactive state.

### get
###### [🏠︎](#index) / [Hooks](#hooks) / get [↓](#set)

Reads a rune's value **and** subscribes the current execution context to it.

```ts
function get<T extends Rune>(rune: T): ReturnType<T>
```

```ts
const count = () => 0

on(() => console.log(get(count)))
// logs: 0

set(count, 1)
// logs: 1
```

### set
###### [🏠︎](#index) / [Hooks](#hooks) / set [↑](#get) [↓](#raw)

Updates a rune's value. Subscribers are notified only when the value actually changes (`!==`).

```ts
function set<T extends Rune>(rune: T, value: ReturnType<T>): void
```

```ts
const count = () => 0

on(() => console.log(get(count)))
// logs: 0

set(count, 1) // logs: 1
set(count, 1) // nothing — value did not change
```

### raw
###### [🏠︎](#index) / [Hooks](#hooks) / raw [↑](#set) [↓](#on)

Reads a rune's value **without** subscribing to it.

```ts
function raw<T extends Rune>(rune: T): ReturnType<T>
```

```ts
const foo = () => 0
const bar = () => 0

const log = () => {
  console.log(get(foo), raw(bar))
}

on(log)
// logs: 0, 0

set(foo, 1) // logs: 1, 0
set(bar, 1) // nothing — bar is read with raw
set(foo, 2) // logs: 2, 1
```

### on
###### [🏠︎](#index) / [Hooks](#hooks) / on [↑](#raw) [↓](#off)

Subscribes either to **the rune itself** (effect) or to **a specific lifecycle event**. Returns a `Destructor` that cancels the subscription.

```ts
function on (rune: Rune): Destructor
function on (rune: Rune, event: Event, listener: Listener, up?: boolean, free?: boolean): Destructor
```

**Effect form** — invoke the function immediately and re-invoke whenever its dependencies change:

```ts
const count = () => 0

const log = () => {
  console.log(get(count))
}

const off = on(log)
// logs: 0

set(count, 1) // logs: 1

off() // unsubscribe
set(count, 2) // nothing
```

**Event form** — listen to a specific event on the rune. Pass `up = true` to activate the slot eagerly so events like `change` start firing.

```ts
on(count, 'change', () => {
  console.log('changed to', raw(count))
})
```

### off
###### [🏠︎](#index) / [Hooks](#hooks) / off [↑](#on) [↓](#update)

Unsubscribes a listener or tears down the slot's whole subscription graph.

```ts
function off (rune: Rune): void
function off (rune: Rune, event: Event, listener: Listener): void
```

```ts
const listener = () => console.log('changed')
on(count, 'change', listener)
off(count, 'change', listener)
```

### update
###### [🏠︎](#index) / [Hooks](#hooks) / update [↑](#off) [↓](#destroy)

Forces subscribers to re-run, even if the rune's value reference is unchanged. Useful when mutating arrays, objects, or other values in place.

```ts
function update (rune: Rune): void
```

```ts
const items = () => []

const log = () => console.log('items:', get(items))

on(log)
// logs: items: []

raw(items).push(1, 2, 3)
update(items)
// logs: items: [1, 2, 3]
```

### destroy
###### [🏠︎](#index) / [Hooks](#hooks) / destroy [↑](#update) [↓](#batch)

Destroys a rune's slot and removes it from the hub registry, clearing all dependencies, subscribers and event listeners.

```ts
function destroy (rune: Rune): void
```

```ts
on(count)
destroy(count) // full cleanup
```

### batch
###### [🏠︎](#index) / [Hooks](#hooks) / batch [↑](#destroy) [↓](#unwatch)

Groups multiple writes into a single notification cycle. Nested `batch` calls are flattened.

```ts
function batch (action: Action): void
```

```ts
const a = () => 0
const b = () => 0
const sum = () => get(a) + get(b)
const log = () => console.log(get(sum))

on(log)
// logs: 0

batch(() => {
  set(a, 400)
  set(b, 20)
})
// logs: 420
```

### unwatch
###### [🏠︎](#index) / [Hooks](#hooks) / unwatch [↑](#batch) [↓](#slot-hook)

Runs a callback with dependency tracking disabled. [`get`](#get) calls inside [`unwatch`](#unwatch) behave like [`raw`](#raw).

```ts
function unwatch<A extends () => any>(action: A): ReturnType<A>
```

```ts
const a = () => 0
const b = () => 0

const log = () => {
  const av = get(a)             // tracked
  const bv = unwatch(() => get(b)) // not tracked
  console.log(av, bv)
}

on(log)
// only re-runs when `a` changes
```

### <a id="slot-hook">slot</a>
###### [🏠︎](#index) / [Hooks](#hooks) / slot [↑](#unwatch) [↓](#getslot)

Returns the slot for a rune in the current hub, creating it lazily if necessary.

```ts
function slot<T extends Rune>(rune: T): Slot<ReturnType<T>>
```

### getSlot
###### [🏠︎](#index) / [Hooks](#hooks) / getSlot [↑](#slot-hook) [↓](#hub-hook)

Returns the slot for a rune **only if it already exists**, otherwise `undefined`. Does not allocate.

```ts
function getSlot<T extends Rune>(rune: T): Slot<ReturnType<T>> | undefined
```

### <a id="hub-hook">hub</a>
###### [🏠︎](#index) / [Hooks](#hooks) / hub [↑](#getslot)

Returns the currently active hub (`Hub.cur`), or `Hub.root` if no custom hub is in scope.

```ts
function hub (): Hub
```

## Common Pitfalls
###### [🏠︎](#index) / Common Pitfalls [↑](#hooks) [↓](#typescript)

<sup>[Dynamic runes](#dynamic-runes) • [Mutating without update](#mutating-without-update) • [Circular dependencies](#circular-dependencies)</sup>

Here are common mistakes to avoid when using RuneHub.

### Dynamic runes
###### [🏠︎](#index) / [Common Pitfalls](#common-pitfalls) / Dynamic runes [↓](#mutating-without-update)

**❌ Don't create runes dynamically without cleanup:**

```ts
// BAD: Creates new rune on every call
function processUser(id: number) {
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

```ts
// GOOD: Reuse the same rune
const userId = () => 0
const userName = () => `User ${get(userId)}`

const logUserName = () => {
  console.log(get(userName))
}

on(logUserName)

function processUser(id: number) {
  set(userId, id)  // Update value, not rune
}

processUser(1)  // logs: User 1
processUser(2)  // logs: User 2
```

**✅ Or use cleanup if you must create dynamically:**

```ts
// ACCEPTABLE: Clean up dynamic runes
function processUser(id: number) {
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

```ts
// BEST: Hub automatically cleans up everything
function processUser(id: number) {
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

### Mutating without update
###### [🏠︎](#index) / [Common Pitfalls](#common-pitfalls) / Mutating without update [↑](#dynamic-runes) [↓](#circular-dependencies)

**❌ Don't mutate objects/arrays without notifying:**

```ts
const items = () => []

const log = () => {
  console.log('Items:', get(items))
}

on(log)

// BAD: Mutates but doesn't notify
raw(items).push(1, 2, 3)
// Effect doesn't re-run!
```

**✅ Call [`update`](#update) after mutation:**

```ts
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

```ts
const items = () => []

const log = () => {
  console.log('Items:', get(items))
}

on(log)

// GOOD: Immutable update
set(items, [...get(items), 1, 2, 3])
// Effect re-runs
```

### Circular dependencies
###### [🏠︎](#index) / [Common Pitfalls](#common-pitfalls) / Circular dependencies [↑](#mutating-without-update)

**❌ Don't create circular dependencies:**

```ts
// BAD: a depends on b, b depends on a
const a = () => get(b) + 1
const b = () => get(a) + 1

console.log(get(a))  // Stack overflow!
```

**✅ Restructure to avoid cycles:**

```ts
// GOOD: Linear dependency chain
const base = () => 0
const a = () => get(base) + 1
const b = () => get(a) + 1

console.log(get(b))  // Works fine
```

**⚠️ Self-updates are OK (with limits):**

```ts
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

## TypeScript
###### [🏠︎](#index) / TypeScript [↑](#common-pitfalls) [↓](#performance)

<sup>[Type inference](#type-inference) • [Explicit return types](#explicit-return-types) • [Explicit variable types](#explicit-variable-types) • [Type safety](#type-safety) • [DRY Principle](#dry-principle)</sup>

RuneHub is written in TypeScript and provides full type inference with zero configuration. Types flow automatically from rune signatures through all hooks.

### Type inference
###### [🏠︎](#index) / [TypeScript](#typescript) / Type inference [↓](#explicit-return-types)

Types are inferred directly from the rune's return value:

```ts
const count = () => 0
// Rune<number>

const name = () => 'Alice'
// Rune<string>

const user = () => ({ name: 'Alice', age: 25 })
// Rune<{ name: string; age: number }>

const items = () => [1, 2, 3]
// Rune<number[]>
```

### Explicit return types
###### [🏠︎](#index) / [TypeScript](#typescript) / Explicit return types [↑](#type-inference) [↓](#explicit-variable-types)

Add explicit return types when inference isn't enough:

```ts
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

### Explicit variable types
###### [🏠︎](#index) / [TypeScript](#typescript) / Explicit variable types [↑](#explicit-return-types) [↓](#type-safety)

Specify the type directly on the variable when you need explicit control:

```ts
const count: Rune<number> = () => 0
const name: Rune<string> = () => 'Alice'
const items: Rune<number[]> = () => [1, 2, 3]
```

### Type safety
###### [🏠︎](#index) / [TypeScript](#typescript) / Type safety [↑](#explicit-variable-types) [↓](#dry-principle)

TypeScript catches errors at compile time:

```ts
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
###### [🏠︎](#index) / [TypeScript](#typescript) / DRY Principle [↑](#type-safety)

RuneHub's architecture naturally follows the **Don't Repeat Yourself (DRY)** principle. When adding new state, you define it in **one place** — unlike many other state management libraries where you must duplicate definitions across interfaces and initial state.

**The problem with other libraries:**

In libraries like Zustand, TypeScript requires duplicating every state key in both the interface and the initial state:

```ts
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

```ts
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

## Performance
###### [🏠︎](#index) / Performance [↑](#typescript)

`rune-hub` ships with benchmarks against **[watch-state](https://www.npmjs.com/package/watch-state)**, **[MobX](https://www.npmjs.com/package/mobx)**, **[Effector](https://www.npmjs.com/package/effector)**, **[Nano Stores](https://www.npmjs.com/package/nanostores)**, **[Jotai](https://www.npmjs.com/package/jotai)**, **[Zustand](https://www.npmjs.com/package/zustand)**, and **[Redux](https://www.npmjs.com/package/redux)**.

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

### Benchmark results

These benchmarks provide a rough performance comparison rather than a complete real-world picture.
Some scenarios may be simplified — for example, they don't account for spread operations or the presence of other state in the store.
The goal was to stress-test RuneHub under challenging conditions to identify and optimize bottlenecks during development.

#### Create state or store
```
Node.js v22.22.2
┌───────────────┬────────────┬──────────────────────┬───────┐
│ RuneHub: Rune │ 46684.53   │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ watch-state   │ 31294.6279 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱ │ 67%   │
│ RuneHub: Hub  │ 28920.1812 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱ │ 61.9% │
│ Zustand       │ 21156.0506 │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱ │ 45.3% │
│ RuneHub: Slot │ 19490.0893 │ ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱ │ 41.7% │
│ Jotai         │ 19395.9451 │ ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱ │ 41.5% │
│ RuneHub: slot │ 17390.4181 │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 37.3% │
│ Redux         │ 9036.9136  │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 19.4% │
│ Redux: object │ 8473.9731  │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 18.2% │
│ Nano Stores   │ 3481.3062  │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 7.5%  │
│ RuneHub: cast │ 2348.0836  │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 5%    │
│ Jotai: store  │ 1188.7018  │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 2.5%  │
│ MobX          │ 1173.0491  │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 2.5%  │
│ Effector      │ 122.5403   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 0.3%  │
└───────────────┴────────────┴──────────────────────┴───────┘
Bun v1.3.11
┌───────────────┬────────────┬──────────────────────┬───────┐
│ RuneHub: Rune │ 34372.2222 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ RuneHub: Hub  │ 28166.2222 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱ │ 81.9% │
│ watch-state   │ 28165.2241 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱ │ 81.9% │
│ Zustand       │ 22090.8015 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱ │ 64.3% │
│ RuneHub: slot │ 19316.1538 │ ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱ │ 56.2% │
│ Nano Stores   │ 19099.3974 │ ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱ │ 55.6% │
│ Jotai         │ 14538.1146 │ ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱ │ 42.3% │
│ Redux: object │ 13587.2654 │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 39.5% │
│ Redux         │ 13235.061  │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 38.5% │
│ RuneHub: Slot │ 12806.7988 │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 37.3% │
│ MobX          │ 9782.2222  │ ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 28.5% │
│ RuneHub: cast │ 3036.4208  │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 8.8%  │
│ Effector      │ 309        │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 0.9%  │
│ Jotai: store  │ 270.9524   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 0.8%  │
└───────────────┴────────────┴──────────────────────┴───────┘
```

#### Create subscription
```
Node.js v22.22.2
┌──────────────────────┬────────────┬──────────────────────┬───────┐
│ Redux                │ 31730.1236 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ RuneHub: Slot event  │ 27402.3714 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱ │ 86.4% │
│ Nano Stores          │ 24622.9483 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ │ 77.6% │
│ Zustand              │ 22035.8814 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱ │ 69.4% │
│ RuneHub: Rune event  │ 20258.6047 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱ │ 63.8% │
│ watch-state          │ 9241.627   │ ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 29.1% │
│ RuneHub: Slot effect │ 4902.5214  │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 15.5% │
│ RuneHub: Rune effect │ 2600.4671  │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 8.2%  │
│ Effector             │ 1889.6157  │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 6%    │
│ Jotai                │ 1394.4903  │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 4.4%  │
│ MobX: autorun        │ 562.8633   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 1.8%  │
│ MobX: reaction       │ 404.1127   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 1.3%  │
└──────────────────────┴────────────┴──────────────────────┴───────┘
Bun v1.3.11
┌──────────────────────┬────────────┬──────────────────────┬───────┐
│ Nano Stores          │ 10180.5645 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ Zustand              │ 9090.3121  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱ │ 89.3% │
│ Redux                │ 8163.9821  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱ │ 80.2% │
│ RuneHub: Rune event  │ 4667.2642  │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱ │ 45.8% │
│ watch-state          │ 4055.7744  │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 39.8% │
│ RuneHub: Slot event  │ 3894.988   │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 38.3% │
│ RuneHub: Slot effect │ 2461.4211  │ ▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 24.2% │
│ RuneHub: Rune effect │ 1776.4096  │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 17.4% │
│ MobX: autorun        │ 1242.0155  │ ▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 12.2% │
│ MobX: reaction       │ 977.8915   │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 9.6%  │
│ Effector             │ 939.3693   │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 9.2%  │
│ Jotai                │ 667.361    │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 6.6%  │
└──────────────────────┴────────────┴──────────────────────┴───────┘
```

#### Get state
```
Node.js v22.22.2
┌─────────────────────┬────────────┬──────────────────────┬───────┐
│ watch-state: raw    │ 50849.899  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ Nano Stores: raw    │ 50486.2929 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 99.3% │
│ Zustand             │ 49345.495  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 97%   │
│ RuneHub: Slot raw   │ 49108.18   │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 96.6% │
│ watch-state: value  │ 49064.5842 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 96.5% │
│ Effector            │ 47846.4951 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱ │ 94.1% │
│ RuneHub: Slot value │ 47827.6176 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱ │ 94.1% │
│ Redux               │ 47730.9118 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱ │ 93.9% │
│ RuneHub: Rune raw   │ 39036.0172 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ │ 76.8% │
│ RuneHub: Rune get   │ 37120.1966 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱ │ 73%   │
│ Nano Stores: get    │ 16002.9076 │ ▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 31.5% │
│ Jotai               │ 8117.2423  │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 16%   │
│ MobX                │ 5207.1911  │ ▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 10.2% │
└─────────────────────┴────────────┴──────────────────────┴───────┘
Bun v1.3.11
┌─────────────────────┬────────────┬──────────────────────┬───────┐
│ Zustand             │ 40001.4828 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ watch-state: value  │ 38011.5738 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 95%   │
│ MobX                │ 36180.0652 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱ │ 90.4% │
│ Nano Stores: raw    │ 35126.0606 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱ │ 87.8% │
│ watch-state: raw    │ 33920.3226 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱ │ 84.8% │
│ Redux               │ 33121.67   │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱ │ 82.8% │
│ RuneHub: Slot value │ 32704.0693 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱ │ 81.8% │
│ RuneHub: Slot raw   │ 31914.3333 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ │ 79.8% │
│ Effector            │ 30665.7573 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ │ 76.7% │
│ RuneHub: Rune raw   │ 28858.125  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱ │ 72.1% │
│ RuneHub: Rune get   │ 27363.4202 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱ │ 68.4% │
│ Nano Stores: get    │ 15047.0163 │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 37.6% │
│ Jotai               │ 4012.3241  │ ▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 10%   │
└─────────────────────┴────────────┴──────────────────────┴───────┘
```

#### Set state
```
Node.js v22.22.2
┌─────────────────────┬────────────┬──────────────────────┬───────┐
│ RuneHub: Slot set   │ 20488.4277 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ RuneHub: Slot value │ 20397.3313 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 99.6% │
│ watch-state: value  │ 16821.743  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱ │ 82.1% │
│ watch-state: set    │ 16353.5084 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ │ 79.8% │
│ Zustand             │ 16294.5902 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ │ 79.5% │
│ RuneHub: Rune       │ 13355.3866 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱ │ 65.2% │
│ Nano Stores         │ 11143.7512 │ ▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱ │ 54.4% │
│ Redux               │ 8771.2152  │ ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱ │ 42.8% │
│ Effector            │ 3462.5     │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 16.9% │
│ Jotai               │ 1130.2526  │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 5.5%  │
│ MobX                │ 926.8854   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 4.5%  │
└─────────────────────┴────────────┴──────────────────────┴───────┘
Bun v1.3.11
┌─────────────────────┬────────────┬──────────────────────┬───────┐
│ RuneHub: Slot set   │ 21665.3923 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ RuneHub: Slot value │ 21058.0672 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 97.2% │
│ watch-state: set    │ 20356.0714 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱ │ 94%   │
│ watch-state: value  │ 19280.592  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱ │ 89%   │
│ RuneHub: Rune       │ 16545.125  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱ │ 76.4% │
│ Redux               │ 14283.6822 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱ │ 65.9% │
│ Nano Stores         │ 12649.0949 │ ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱ │ 58.4% │
│ Zustand             │ 10238.641  │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱ │ 47.3% │
│ MobX                │ 9415.1187  │ ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱ │ 43.5% │
│ Effector            │ 3600.1757  │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 16.6% │
│ Jotai               │ 691.5821   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 3.2%  │
└─────────────────────┴────────────┴──────────────────────┴───────┘
```

#### Batching
```
Node.js v22.22.2
┌──────────────────────┬───────────┬──────────────────────┬───────┐
│ RuneHub: Slot event  │ 5947.0453 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ RuneHub: Rune event  │ 3329.3485 │ ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱ │ 56%   │
│ RuneHub: Slot effect │ 3095.3745 │ ▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱ │ 52%   │
│ RuneHub: Rune effect │ 2479.4779 │ ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱ │ 41.7% │
│ Nano Stores          │ 2139.7927 │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 36%   │
│ Zustand              │ 1874.8525 │ ▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 31.5% │
│ Redux                │ 1442.3216 │ ▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 24.3% │
│ watch-state          │ 1059.3693 │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 17.8% │
│ Effector             │ 292.2331  │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 4.9%  │
│ Jotai                │ 129.5738  │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 2.2%  │
│ MobX                 │ 77.0604   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 1.3%  │
└──────────────────────┴───────────┴──────────────────────┴───────┘
Bun v1.3.11
┌──────────────────────┬───────────┬──────────────────────┬───────┐
│ RuneHub: Slot event  │ 7443.0423 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ RuneHub: Rune event  │ 5383.7851 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱ │ 72.3% │
│ Nano Stores          │ 4028.0498 │ ▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱ │ 54.1% │
│ RuneHub: Rune effect │ 3604.48   │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱ │ 48.4% │
│ RuneHub: Slot effect │ 3601.7511 │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱ │ 48.4% │
│ Redux                │ 3154.6599 │ ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱ │ 42.4% │
│ Zustand              │ 1483.2888 │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 19.9% │
│ MobX                 │ 1232.278  │ ▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 16.6% │
│ watch-state          │ 1080.8172 │ ▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 14.5% │
│ Effector             │ 292.7986  │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 3.9%  │
│ Jotai                │ 63.4899   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 0.9%  │
└──────────────────────┴───────────┴──────────────────────┴───────┘
```

#### Counter (1 change 1 subscription)
```
Node.js v22.22.2
┌──────────────────────┬───────────┬──────────────────────┬───────┐
│ Zustand              │ 2432.0183 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ RuneHub: Slot event  │ 2025.097  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱ │ 83.3% │
│ Nano Stores          │ 1407.2092 │ ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱ │ 57.9% │
│ RuneHub: Rune event  │ 1401.4698 │ ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱ │ 57.6% │
│ RuneHub: Slot effect │ 1097.4231 │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱ │ 45.1% │
│ watch-state          │ 1035.6864 │ ▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱ │ 42.6% │
│ RuneHub: Rune effect │ 966.4931  │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 39.7% │
│ Redux                │ 799.1138  │ ▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 32.9% │
│ Jotai                │ 174.8552  │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 7.2%  │
│ MobX                 │ 123.7651  │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 5.1%  │
│ Effector             │ 83.6141   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 3.4%  │
└──────────────────────┴───────────┴──────────────────────┴───────┘
Bun v1.3.11
┌──────────────────────┬───────────┬──────────────────────┬───────┐
│ Nano Stores          │ 3433.5285 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ RuneHub: Slot event  │ 2336.332  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱ │ 68%   │
│ Zustand              │ 2171.374  │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱ │ 63.2% │
│ RuneHub: Rune event  │ 1835.3895 │ ▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱ │ 53.5% │
│ RuneHub: Slot effect │ 1211.5649 │ ▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱ │ 35.3% │
│ watch-state          │ 1131.1095 │ ▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 32.9% │
│ RuneHub: Rune effect │ 1053.6331 │ ▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 30.7% │
│ Redux                │ 966.7319  │ ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 28.2% │
│ MobX                 │ 871.864   │ ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 25.4% │
│ Effector             │ 151.75    │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 4.4%  │
│ Jotai                │ 88.1852   │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 2.6%  │
└──────────────────────┴───────────┴──────────────────────┴───────┘
```

#### Counter (500 changes 100 subscriptions)
```
Node.js v22.22.2
┌──────────────────────┬────────┬──────────────────────┬───────┐
│ RuneHub: Slot event  │ 1.29   │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ Zustand              │ 1.04   │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱ │ 80.6% │
│ RuneHub: Rune event  │ 0.9    │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱ │ 69.8% │
│ Nano Stores          │ 0.7143 │ ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱ │ 55.4% │
│ Redux                │ 0.3821 │ ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 29.6% │
│ Effector             │ 0.1678 │ ▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 13%   │
│ RuneHub: Rune effect │ 0.1242 │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 9.6%  │
│ RuneHub: Slot effect │ 0.1242 │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 9.6%  │
│ Jotai                │ 0.1039 │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 8.1%  │
│ watch-state          │ 0.0712 │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 5.5%  │
│ MobX                 │ 0.0141 │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 1.1%  │
└──────────────────────┴────────┴──────────────────────┴───────┘
Bun v1.3.11
┌──────────────────────┬────────┬──────────────────────┬───────┐
│ RuneHub: Slot event  │ 1.9633 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ │ 100%  │
│ RuneHub: Rune event  │ 1.4667 │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱ │ 74.7% │
│ Zustand              │ 1.1633 │ ▰▰▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱ │ 59.3% │
│ Nano Stores          │ 0.9633 │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱ │ 49.1% │
│ Redux                │ 0.5781 │ ▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 29.4% │
│ Effector             │ 0.2252 │ ▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 11.5% │
│ MobX                 │ 0.2171 │ ▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 11.1% │
│ RuneHub: Slot effect │ 0.1733 │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 8.8%  │
│ RuneHub: Rune effect │ 0.1645 │ ▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 8.4%  │
│ watch-state          │ 0.0693 │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 3.5%  │
│ Jotai                │ 0.0651 │ ▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱ │ 3.3%  │
└──────────────────────┴────────┴──────────────────────┴───────┘
```

### Check it out yourself

To run the benchmarks on your own machine, clone the repository, install dependencies, and execute the test commands:

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
# Node.js
npm run speed:node:init       # initialization
npm run speed:node:get        # reads
npm run speed:node:set        # writes
npm run speed:node:batching   # batched updates
npm run speed:node:examples   # end-to-end scenarios

# Bun
npm run speed:bun:init        # initialization
npm run speed:bun:get         # reads
npm run speed:bun:set         # writes
npm run speed:bun:batching    # batched updates
npm run speed:bun:examples    # end-to-end scenarios
```

## Links

- **Creator**: [Mike Lysikov](http://github.com/d8corp)
- **Source Code**: [GitHub](https://github.com/d8corp/rune-hub)
- **Repository**: [npm](https://www.npmjs.com/package/rune-hub) • [npmx](https://npmx.dev/package/rune-hub)
- **Progenitor**: [watch-state](https://www.npmjs.com/package/watch-state)
- **Created for**: [@innet/dom](https://github.com/d8corp/innet-dom)
- **Frameworks**: [@rune-hub/react](https://github.com/d8corp/rune-hub-react)

**Contributions are welcome!** Please feel free to submit [issues](https://github.com/d8corp/rune-hub/issues) and [pull requests](https://github.com/d8corp/rune-hub/pulls).

[![issues](https://img.shields.io/github/issues-raw/d8corp/rune-hub)](https://github.com/d8corp/rune-hub/issues)
