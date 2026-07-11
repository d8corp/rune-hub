import { createEvent as createEffectorEvent, createStore as createEffectorStore } from 'effector'
import { atom as jotai, createStore as createJotaiStore } from 'jotai/vanilla'
import { autorun, observable } from 'mobx'
import { atom } from 'nanostores'
import { describe, test } from 'perfocode'
import { createStore } from 'redux'
import { State, Watch } from 'watch-state'
import { createStore as createZStore } from 'zustand/vanilla'

import type { Destructor } from '../src'
import { get, Hub, on, raw, set, Slot } from '../src'

export function getTests () {
  describe('Get Value', () => {
    describe('Get unwatched State value', () => {
      // RuneHub
      const shState = () => 0
      const shSlot = new Slot(() => 0)

      test('RuneHub: Rune get', () => get(shState), { highlight: true })
      Hub.root.destroy()
      test('RuneHub: Rune raw', () => raw(shState), { highlight: true })
      Hub.root.destroy()
      test('RuneHub: Slot value', () => shSlot.value, { highlight: true })
      test('RuneHub: Slot raw', () => shSlot.raw, { highlight: true })

      // watch-state
      const state = new State(0)

      test('watch-state: raw', () => state.raw)
      test('watch-state: value', () => state.value)

      // Zustand
      const zStore = createZStore(() => ({
        bears: 0,
      }))

      test('Zustand', () => zStore.getState().bears)

      // Nano Stores
      const nanoStore = atom(0)

      test('Nano Stores: get', () => nanoStore.get())
      test('Nano Stores: raw', () => nanoStore.value)

      // Jotai
      const jotaiStore = createJotaiStore()
      const jotaiState = jotai(0)

      test('Jotai', () => jotaiStore.get(jotaiState))

      // Effector
      const effectorState = createEffectorStore(0)

      test('Effector', () => effectorState.getState())

      // MobX
      const mobxState = observable.box(0)

      test('MobX', () => mobxState.get())

      // Redux
      const reduxStore = createStore<{ value: number }, any>((state = { value: 0 }) => state)

      test('Redux', () => reduxStore.getState().value)
    })

    describe('Get unwatched changed State', () => {
      // RuneHub
      const shState = () => 0
      set(shState, 1)
      const shSlot = new Slot(() => 0)
      shSlot.value = 1

      test('RuneHub: Rune get', () => get(shState), { highlight: true })
      test('RuneHub: Rune raw', () => raw(shState), { highlight: true })
      Hub.root.destroy()
      test('RuneHub: Slot value', () => shSlot.value, { highlight: true })
      test('RuneHub: Slot raw', () => shSlot.raw, { highlight: true })

      // watch-state
      const state = new State(0)
      state.value = 1

      test('watch-state: raw', () => state.raw)
      test('watch-state: value', () => state.value)

      // Zustand
      const zStore = createZStore(() => ({
        bears: 0,
      }))

      zStore.setState({ bears: 1 })

      test('Zustand', () => zStore.getState().bears)

      // Nano Stores
      const nanoStore = atom(0)
      nanoStore.set(1)

      test('Nano Stores', () => nanoStore.get())

      // Jotai
      const jotaiStore = createJotaiStore()
      const jotaiState = jotai(0)
      jotaiStore.set(jotaiState, 1)

      test('Jotai', () => jotaiStore.get(jotaiState))

      // Effector
      const setValue = createEffectorEvent<number>()
      const effectorState = createEffectorStore(0)

      effectorState.on(setValue, (state, newState) => newState)
      setValue(1)

      test('Effector', () => effectorState.getState())

      // MobX
      const mobxState = observable.box(0)
      mobxState.set(1)

      test('MobX', () => mobxState.get())

      // Redux
      const reduxStore = createStore((state: any, action: any) => {
        if (action.type === 'SET_VALUE') {
          return { ...state, value: action.payload }
        }

        return state
      }, { value: 0 })

      reduxStore.dispatch({ type: 'SET_VALUE', payload: 1 })

      test('Redux', () => reduxStore.getState().value)
    })

    describe('Get watched State value', () => {
      const subscribes: Destructor[] = []

      // RuneHub
      const hub = new Hub()
      const hubAuto = new Hub()
      const shState = () => 0
      const shSlot = new Slot(() => 0)
      const shSlotAuto = new Slot(() => 0)

      subscribes.push(
        hub.use(() => on(shState, 'change', () => {})),
        hubAuto.use(() => on(() => get(shState))),
        shSlot.on('change', () => {}),
        new Slot(() => shSlotAuto.value).on(),
      )

      hub.use(() => {
        test('RuneHub: Rune get', () => get(shState), { highlight: true })
        test('RuneHub: Rune raw', () => raw(shState), { highlight: true })
      })

      hub.destroy()

      hubAuto.use(() => {
        test('RuneHub: Rune get auto', () => get(shState), { highlight: true })
        test('RuneHub: Rune raw auto', () => raw(shState), { highlight: true })
      })

      hubAuto.destroy()

      test('RuneHub: Slot value', () => shSlot.value, { highlight: true })
      test('RuneHub: Slot raw', () => shSlot.raw, { highlight: true })
      test('RuneHub: Slot value auto', () => shSlotAuto.value, { highlight: true })
      test('RuneHub: Slot raw auto', () => shSlotAuto.raw, { highlight: true })

      // watch-state
      const state = new State(0)
      const watch = new Watch(() => state.value)

      subscribes.push(
        () => {
          watch.destroy()
        },
      )

      test('watch-state: value', () => state.value)
      test('watch-state: raw', () => state.raw)

      // Zustand
      const zStore = createZStore(() => ({
        bears: 0,
      }))

      subscribes.push(
        zStore.subscribe(() => {}),
      )

      test('Zustand', () => zStore.getState().bears)

      // Nano Stores
      const nanoState = atom(0)

      subscribes.push(
        nanoState.subscribe(() => {}),
      )

      test('Nano Stores: get', () => nanoState.get())
      test('Nano Stores: raw', () => nanoState.value)

      // Jotai
      const jotaiStore = createJotaiStore()
      const jotaiState = jotai(0)

      subscribes.push(
        jotaiStore.sub(jotaiState, () => {}),
      )

      test('Jotai', () => jotaiStore.get(jotaiState))

      // Effector
      const effectorState = createEffectorStore(0)

      subscribes.push(
        effectorState.subscribe(() => {}),
      )

      test('Effector', () => effectorState.getState())

      // MobX
      const mobxState = observable.box(0)

      subscribes.push(
        autorun(() => mobxState.get()),
      )

      test('MobX', () => mobxState.get())

      // Redux
      const reduxStore = createStore<{ value: number }, any>((state = { value: 0 }) => state)

      subscribes.push(
        reduxStore.subscribe(() => {}),
      )

      test('Redux', () => reduxStore.getState().value)

      // Cleanup
      subscribes.forEach(subscribe => subscribe())
    })
  })
}
