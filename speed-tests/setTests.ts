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

import { get, Hub, on, raw, set, Slot } from '../src'

export function setTests () {
  describe('Set Value', () => {
    describe('Set unwatched State value', () => {
      // RuneHub
      const shState = () => 0
      const shSlot = new Slot(() => 0)

      test('RuneHub: Rune', () => set(shState, raw(shState) + 1), { highlight: true })
      Hub.root.destroy()
      test('RuneHub: Slot set', () => shSlot.set(shSlot.raw + 1), { highlight: true })
      test('RuneHub: Slot value', () => { shSlot.value = shSlot.raw + 1 }, { highlight: true })

      // watch-state
      const state = new State(0)

      test('watch-state: set', () => state.set(state.raw + 1))
      test('watch-state: value', () => { state.value = state.raw + 1 })

      // Zustand
      const zStore = createZStore(() => ({
        bears: 0,
      }))

      test('Zustand', () => zStore.setState({ bears: zStore.getState().bears + 1 }))

      // Nano Stores
      const nanoStore = atom(0)

      test('Nano Stores', () => nanoStore.set(nanoStore.get() + 1))

      // Jotai
      const jotaiStore = createJotaiStore()
      const jotaiState = jotai(0)

      test('Jotai', () => jotaiStore.set(jotaiState, (c) => c + 1))

      // Effector
      const incrementEffector = createEffectorEvent()
      createEffectorStore(0).on(incrementEffector, state => state + 1)

      test('Effector', () => incrementEffector())

      // MobX
      const mobxState = observable.box(0)

      test('MobX', () => mobxState.set(mobxState.get() + 1))

      // Redux
      function reducer (state: any, action: any) {
        if (action.type === 'inc') {
          return { ...state, count: state.count + 1 }
        }

        return state
      }

      const reduxStore = createStore(reducer, { count: 0 })

      test('Redux', () => reduxStore.dispatch({ type: 'inc' }))
    })

    describe('Set watched State value', () => {
      // RuneHub
      const hub = new Hub()
      const hubAuto = new Hub()
      const shState = () => 0
      const shSlot = new Slot(() => 0)
      const shSlotAuto = new Slot(() => 0)

      const unwatch1 = hub.use(() => on(shState, 'change', () => {}))
      const unwatch2 = hubAuto.use(() => on(() => get(shState)))
      const unwatchSlot = shSlot.on('change', () => {})
      const unwatchSlotAuto = new Slot(() => shSlotAuto.value).on()

      hub.use(() => {
        test('RuneHub: Rune event', () => set(shState, raw(shState) + 1), { highlight: true })
      })

      hub.destroy()

      hubAuto.use(() => {
        test('RuneHub: Rune effect', () => set(shState, raw(shState) + 1), { highlight: true })
      })

      hubAuto.destroy()

      test('RuneHub: Slot set event', () => shSlot.set(shSlot.raw + 1), { highlight: true })
      test('RuneHub: Slot value event', () => { shSlot.value = shSlot.raw + 1 }, { highlight: true })
      test('RuneHub: Slot set effect', () => shSlotAuto.set(shSlotAuto.raw + 1), { highlight: true })
      test('RuneHub: Slot value effect', () => { shSlotAuto.value = shSlotAuto.raw + 1 }, { highlight: true })

      // watch-state
      const state = new State(0)
      const watch = new Watch(() => state.value)

      test('watch-state: set', () => state.set(state.raw + 1))
      test('watch-state: value', () => { state.value = state.raw + 1 })

      // Zustand
      const zStore = createZStore(() => ({
        bears: 0,
      }))

      const unwatch3 = zStore.subscribe(() => {})

      test('Zustand', () => zStore.setState({ bears: zStore.getState().bears + 1 }))

      // Nano Stores
      const nanoStore = atom(0)

      const unwatch4 = nanoStore.subscribe(() => {})

      test('Nano Stores', () => nanoStore.set(nanoStore.get() + 1))

      // Jotai
      const jotaiStore = createJotaiStore()
      const jotaiState = jotai(0)

      const unwatch5 = jotaiStore.sub(jotaiState, () => {})

      test('Jotai', () => jotaiStore.set(jotaiState, (c) => c + 1))

      // Effector
      const increment = createEffectorEvent()
      const effectorStore = createEffectorStore(0).on(increment, state => state + 1)

      const unwatch6 = effectorStore.watch(() => {})

      test('Effector', () => increment())

      // MobX
      const mobxState1 = observable.box(0)
      const mobxState2 = observable.box(0)

      const unwatch7 = autorun(() => mobxState1.get())
      const unwatch8 = reaction(() => mobxState2.get(), () => {})

      test('MobX: autorun', () => mobxState1.set(mobxState1.get() + 1))
      test('MobX: reaction', () => mobxState2.set(mobxState2.get() + 1))

      // Redux
      function reducer (state: any, action: any) {
        if (action.type === 'inc') {
          return { ...state, count: state.count + 1 }
        }

        return state
      }

      const reduxStore = createStore(reducer, { count: 0 })

      const unwatch9 = reduxStore.subscribe(() => {})

      test('Redux', () => reduxStore.dispatch({ type: 'inc' }))

      // Cleanup
      unwatch1()
      unwatch2()
      unwatch3()
      unwatch4()
      unwatch5()
      unwatch6()
      unwatch7()
      unwatch8()
      unwatch9()
      unwatchSlot()
      unwatchSlotAuto()
      watch.destroy()
    })

    describe('Set double watched State value', () => {
      // RuneHub
      const hub = new Hub()
      const hubAuto = new Hub()
      const shState = () => 0
      const shSlot = new Slot(() => 0)
      const shSlotAuto = new Slot(() => 0)

      const unwatch1 = hub.use(() => on(shState, 'change', () => {}))
      const unwatch11 = hub.use(() => on(shState, 'change', () => {}))
      const unwatch2 = hubAuto.use(() => on(() => get(shState)))
      const unwatch21 = hubAuto.use(() => on(() => get(shState)))
      const unwatchSlot = shSlot.on('change', () => {})
      const unwatchSlot1 = shSlot.on('change', () => {})
      const unwatchSlotAuto = new Slot(() => shSlotAuto.value).on()
      const unwatchSlotAuto1 = new Slot(() => shSlotAuto.value).on()

      hub.use(() => {
        test('RuneHub: Rune event', () => set(shState, raw(shState) + 1), { highlight: true })
      })

      hubAuto.use(() => {
        test('RuneHub: Rune effect', () => set(shState, raw(shState) + 1), { highlight: true })
      })

      test('RuneHub: Slot set event', () => shSlot.set(shSlot.raw + 1), { highlight: true })
      test('RuneHub: Slot value event', () => { shSlot.value = shSlot.raw + 1 }, { highlight: true })
      test('RuneHub: Slot set effect', () => shSlotAuto.set(shSlotAuto.raw + 1), { highlight: true })
      test('RuneHub: Slot value effect', () => { shSlotAuto.value = shSlotAuto.raw + 1 }, { highlight: true })

      // watch-state
      const state = new State(0)
      const watch1 = new Watch(() => state.value)
      const watch2 = new Watch(() => state.value)

      test('watch-state: set', () => state.set(state.raw + 1))
      test('watch-state: value', () => { state.value = state.raw + 1 })

      // Zustand
      const zStore = createZStore(() => ({
        bears: 0,
      }))

      const unwatch3 = zStore.subscribe(() => {})
      const unwatch31 = zStore.subscribe(() => {})

      test('Zustand', () => zStore.setState({ bears: zStore.getState().bears + 1 }))

      // Nano Stores
      const nanoStore = atom(0)

      const unwatch4 = nanoStore.subscribe(() => {})
      const unwatch41 = nanoStore.subscribe(() => {})

      test('Nano Stores', () => nanoStore.set(nanoStore.get() + 1))

      // Jotai
      const jotaiStore = createJotaiStore()
      const jotaiState = jotai(0)

      const unwatch5 = jotaiStore.sub(jotaiState, () => {})
      const unwatch51 = jotaiStore.sub(jotaiState, () => {})

      test('Jotai', () => jotaiStore.set(jotaiState, (c) => c + 1))

      // Effector
      const increment = createEffectorEvent()
      const effectorStore = createEffectorStore(0).on(increment, state => state + 1)

      const unwatch6 = effectorStore.watch(() => {})
      const unwatch61 = effectorStore.watch(() => {})

      test('Effector', () => increment())

      // MobX
      const mobxState1 = observable.box(0)
      const mobxState2 = observable.box(0)

      const unwatch7 = autorun(() => mobxState1.get())
      const unwatch71 = autorun(() => mobxState1.get())
      const unwatch8 = reaction(() => mobxState2.get(), () => {})
      const unwatch81 = reaction(() => mobxState2.get(), () => {})

      test('MobX: autorun', () => mobxState1.set(mobxState1.get() + 1))
      test('MobX: reaction', () => mobxState2.set(mobxState2.get() + 1))

      // Redux
      function reducer (state: any, action: any) {
        if (action.type === 'inc') {
          return { ...state, count: state.count + 1 }
        }

        return state
      }

      const reduxStore = createStore(reducer, { count: 0 })

      const unwatch9 = reduxStore.subscribe(() => {})
      const unwatch91 = reduxStore.subscribe(() => {})

      test('Redux', () => reduxStore.dispatch({ type: 'inc' }))

      // Cleanup
      unwatch1()
      unwatch11()
      unwatch2()
      unwatch21()
      unwatch3()
      unwatch31()
      unwatch4()
      unwatch41()
      unwatch5()
      unwatch51()
      unwatch6()
      unwatch61()
      unwatch7()
      unwatch71()
      unwatch8()
      unwatch81()
      unwatch9()
      unwatch91()
      unwatchSlot()
      unwatchSlot1()
      unwatchSlotAuto()
      unwatchSlotAuto1()
      watch1.destroy()
      watch2.destroy()
    })
  })
}
