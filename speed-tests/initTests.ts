import {
  createEvent as createEffectorEvent,
  createStore as createEffectorStore,
} from 'effector'
import { atom as jotai, createStore as createJotaiStore } from 'jotai/vanilla'
import { autorun, observable, reaction } from 'mobx'
import { atom } from 'nanostores'
import { describe, test } from 'perfocode'
import { createStore } from 'redux'
import { State, Watch } from 'watch-state'
import { createStore as createZStore } from 'zustand/vanilla'

import { get, Hub, on, raw, Slot } from '../src'

export function initTests () {
  describe('Initialisation', () => {
    describe('State', () => {
      describe('Create a state', () => {
        // RuneHub
        test('RuneHub: Rune', () => () => 0, { highlight: true })
        test('RuneHub: slot', () => Hub.slot(() => 0), { highlight: true })
        test('RuneHub: cast', () => Hub.root.cast(() => 0), { highlight: true })
        Hub.root.destroy()
        test('RuneHub: Slot', () => new Slot(() => 0), { highlight: true })
        test('RuneHub: Hub', () => new Hub(), { highlight: true })

        // watch-state
        test('watch-state', () => new State(0))

        // Zustand
        test('Zustand', () => createZStore(() => ({
          bears: 0,
        })))

        // Nano Stores
        test('Nano Stores', () => atom(0))

        // Jotai
        test('Jotai', () => jotai(0))
        test('Jotai: store', () => createJotaiStore())

        // Effector
        test('Effector', () => createEffectorStore(0))

        // MobX
        test('MobX', () => observable.box(0))

        // Redux
        test('Redux', () => createStore((state = 0) => state))
        test('Redux: object', () => createStore(() => ({ v: 0 })))
      })

      describe('Create and get a state', () => {
        const jotaiStore = createJotaiStore()

        // RuneHub
        test('RuneHub: Rune raw', () => raw(() => 0), { highlight: true })
        Hub.root.destroy()
        test('RuneHub: Rune get', () => get(() => 0), { highlight: true })
        Hub.root.destroy()
        test('RuneHub: Slot raw', () => new Slot(() => 0).raw, { highlight: true })
        test('RuneHub: Slot value', () => new Slot(() => 0).value, { highlight: true })

        // watch-state
        test('watch-state: raw', () => new State(0).raw)
        test('watch-state: value', () => new State(0).value)

        // Zustand
        test('Zustand', () => createZStore(() => ({
          bears: 0,
        })).getState().bears)

        // Nano Stores
        test('Nano Stores: value', () => atom(0).value)
        test('Nano Stores: get', () => atom(0).get())

        // Jotai
        test('Jotai', () => jotaiStore.get(jotai(0)))

        // Effector
        test('Effector', () => createEffectorStore(0).getState())

        // MobX
        test('MobX', () => observable.box(0).get())

        // Redux
        test('Redux', () => createStore((state = 0) => state).getState())
        test('Redux: object', () => createStore(() => ({ v: 0 })).getState().v)
      })
    })

    describe('Subscription', () => {
      describe('Create state subscription', () => {
        // RuneHub
        const rune = () => 0
        const slot = new Slot(() => 0)

        test('RuneHub: Rune event', () => on(rune, 'change', () => {}), { highlight: true, useAfter: true })
        Hub.root.destroy()
        test('RuneHub: Rune effect', () => on(() => get(rune)), { highlight: true, useAfter: true })
        Hub.root.destroy()
        test('RuneHub: Slot event', () => slot.on('change', () => {}), { highlight: true, useAfter: true })
        test('RuneHub: Slot effect', () => new Slot(() => slot.value).on(), { highlight: true, useAfter: true })

        // watch-state
        const state = new State(0)

        test('watch-state', () => {
          const watch = new Watch(() => state.value)

          return () => {
            watch.destroy()
          }
        }, { useAfter: true })

        // Zustand
        const zStore = createZStore(() => ({
          bears: 0,
        }))

        test('Zustand', () => zStore.subscribe((next, prev) => {
          if (next.bears !== prev.bears) { /* empty */ }
        }), { useAfter: true })

        // Nano Stores
        const nanoStore = atom(0)
        test('Nano Stores', () => nanoStore.subscribe(() => {}), { useAfter: true })

        // Jotai
        const jotaiStore = createJotaiStore()
        const jotaiState = jotai(0)

        test('Jotai', () => jotaiStore.sub(jotaiState, () => {}), { useAfter: true })

        // Effector
        const effectorStore = createEffectorStore(0)

        test('Effector', () => effectorStore.watch(() => {}), { useAfter: true })

        // MobX
        const mobx1 = observable.box(0)
        const mobx2 = observable.box(0)

        test('MobX: autorun', () => autorun(() => mobx1.get()), { useAfter: true })
        test('MobX: reaction', () => reaction(() => mobx2.get(), () => {}), { useAfter: true })

        // Redux
        const reduxStore = createStore((state = { value: 0 }) => state)

        test('Redux', () => reduxStore.subscribe(() => {}), { useAfter: true })
      })

      describe('Create state subscription + unsubscribe', () => {
        // RuneHub
        const rune = () => 0
        const slot = new Slot(() => 0)

        test('RuneHub: Rune event', () => on(rune, 'change', () => {})(), { highlight: true })
        Hub.root.destroy()
        test('RuneHub: Rune effect', () => on(() => get(rune))(), { highlight: true })
        Hub.root.destroy()
        test('RuneHub: Slot event', () => slot.on('change', () => {})(), { highlight: true })
        test('RuneHub: Slot effect', () => new Slot(() => slot.value).on()(), { highlight: true })

        // watch-state
        const state = new State(0)

        test('watch-state', () => new Watch(() => state.value).destroy())

        // Zustand
        const zStore = createZStore(() => ({
          bears: 0,
        }))

        test('Zustand', () => zStore.subscribe((next, prev) => {
          if (next.bears !== prev.bears) { /* empty */ }
        })())

        // Nano Stores
        const nanoStore = atom(0)
        test('Nano Stores', () => nanoStore.subscribe(() => {})())

        // Jotai
        const jotaiStore = createJotaiStore()
        const jotaiState = jotai(0)

        test('Jotai', () => jotaiStore.sub(jotaiState, () => {})())

        // Effector
        const effectorStore = createEffectorStore(0)

        test('Effector', () => effectorStore.watch(() => {})())

        // MobX
        const mobx1 = observable.box(0)
        const mobx2 = observable.box(0)

        test('MobX: autorun', () => autorun(() => mobx1.get())())
        test('MobX: reaction', () => reaction(() => mobx2.get(), () => {})())

        // Redux
        const reduxStore = createStore((state = { value: 0 }) => state)

        test('Redux', () => reduxStore.subscribe(() => {})())
      })

      describe('Duplicate listener', () => {
        const listener = () => {}

        // RuneHub
        const rune = () => 0
        const slot = new Slot(() => 0)

        const slotListener = () => {}
        const slotEffect = new Slot(() => slot.value)

        const runeEffect = () => {
          get(rune)
        }

        test('RuneHub: Rune event', () => on(rune, 'change', listener), { highlight: true })
        Hub.root.destroy()
        test('RuneHub: Rune effect', () => on(runeEffect), { highlight: true })
        Hub.root.destroy()
        test('RuneHub: Slot event', () => slot.on('change', slotListener), { highlight: true })
        test('RuneHub: Slot effect', () => slotEffect.on(), { highlight: true })

        // watch-state
        const state = new State(0)
        const watch = () => state.value

        test('watch-state', () => new Watch(watch))

        // Zustand
        const zStore = createZStore(() => ({
          bears: 0,
        }))

        test('Zustand', () => zStore.subscribe(listener))

        // Nano Stores
        const nanoState = atom(0)

        test('Nano Stores', () => nanoState.subscribe(listener))

        // Jotai
        const jotaiStore = createJotaiStore()
        const jotaiState = jotai(0)

        test('Jotai', () => jotaiStore.sub(jotaiState, listener))

        // Effector
        const messageEvent = createEffectorEvent()

        test('Effector', () => messageEvent.watch(listener))

        // MobX
        const mobx1 = observable.box(0)
        const mobx2 = observable.box(0)
        const mobXListener = () => mobx2.get()

        test('MobX', () => reaction(() => mobx1.get(), listener))
        test('MobX: auto', () => autorun(mobXListener))

        // Redux
        const reduxStore = createStore((state = { value: 0 }) => state)

        test('Redux', () => reduxStore.subscribe(listener))
      })
    })
  })
}
