import {
  createEvent as createEffectorEvent,
  createStore as createEffectorStore,
} from 'effector'
import { atom as jotai, createStore as createJotaiStore } from 'jotai/vanilla'
import { action, autorun, observable } from 'mobx'
import { atom } from 'nanostores'
import { describe, test } from 'perfocode'
import { createStore } from 'redux'
import { callEvent, State, Watch } from 'watch-state'
import { createStore as createZStore } from 'zustand/vanilla'

import { batch, get, Hub, on, raw, set, Slot } from '../src'

export function batchingTests () {
  describe('Batching', () => {
    describe('Batch watched State updates', () => {
      // RuneHub
      const hub = new Hub()
      const hubAuto = new Hub()
      const shState = () => 0
      const shSlot = new Slot(() => 0)
      const shSlotAuto = new Slot(() => 0)

      const hubAction = () => batch(() => {
        for (let i = 0; i < 10; i++) {
          set(shState, raw(shState) + 1)
        }
      })

      const slotAction = () => shSlot.hub.batch(() => {
        for (let i = 0; i < 10; i++) {
          shSlot.value = shSlot.raw + 1
        }
      })

      const slotAutoAction = () => shSlotAuto.hub.batch(() => {
        for (let i = 0; i < 10; i++) {
          shSlotAuto.value = shSlotAuto.raw + 1
        }
      })

      const unwatch1 = hub.use(() => on(shState, 'change', () => {}))
      const unwatch2 = hubAuto.use(() => on(() => get(shState)))
      const unwatchSlot = shSlot.on('change', () => {})
      const unwatchSlotAuto = new Slot(() => shSlotAuto.value).on()

      hub.use(() => {
        test('RuneHub: Rune event', () => hubAction(), { highlight: true })
      })

      hub.destroy()

      hubAuto.use(() => {
        test('RuneHub: Rune effect', () => hubAction(), { highlight: true })
      })

      hubAuto.destroy()

      test('RuneHub: Slot event', () => slotAction(), { highlight: true })
      test('RuneHub: Slot effect', () => slotAutoAction(), { highlight: true })

      // watch-state
      const state = new State(0)
      const watch = new Watch(() => state.value)

      const stateAction = () => callEvent(() => {
        for (let i = 0; i < 10; i++) {
          state.value = state.raw + 1
        }
      })

      test('watch-state', () => stateAction())

      // Zustand
      const zStore = createZStore(() => ({
        bears: 0,
      }))

      const unwatch3 = zStore.subscribe(() => {})

      const zAction = () => {
        for (let i = 0; i < 10; i++) {
          zStore.setState({ bears: zStore.getState().bears + 1 })
        }
      }

      test('Zustand', () => zAction())

      // Nano Stores
      const nanoStore = atom(0)

      const unwatch4 = nanoStore.subscribe(() => {})

      const nanoAction = () => {
        for (let i = 0; i < 10; i++) {
          nanoStore.set(nanoStore.get() + 1)
        }
      }

      test('Nano Stores', () => nanoAction())

      // Jotai
      const jotaiStore = createJotaiStore()
      const jotaiState = jotai(0)

      const unwatch5 = jotaiStore.sub(jotaiState, () => {})

      const jotaiAction = () => {
        for (let i = 0; i < 10; i++) {
          jotaiStore.set(jotaiState, c => c + 1)
        }
      }

      test('Jotai', () => jotaiAction())

      // Effector
      const increment = createEffectorEvent()
      const effectorStore = createEffectorStore(0).on(increment, s => s + 1)

      const unwatch6 = effectorStore.watch(() => {})

      const effectorAction = () => {
        for (let i = 0; i < 10; i++) {
          increment()
        }
      }

      test('Effector', () => effectorAction())

      // MobX
      const mobxState = observable.box(0)

      const unwatch7 = autorun(() => mobxState.get())

      const mobxAction = action(() => {
        for (let i = 0; i < 10; i++) {
          mobxState.set(mobxState.get() + 1)
        }
      })

      test('MobX', () => mobxAction())

      // Redux
      const reduxStore = createStore((s: number = 0, a) => a.type === 'inc' ? s + 1 : s)

      const unwatch8 = reduxStore.subscribe(() => {})

      const reduxAction = () => {
        for (let i = 0; i < 10; i++) {
          reduxStore.dispatch({ type: 'inc' })
        }
      }

      test('Redux', () => reduxAction())

      // Cleanup
      unwatch1()
      unwatch2()
      unwatch3()
      unwatch4()
      unwatch5()
      unwatch6()
      unwatch7()
      unwatch8()
      unwatchSlot()
      unwatchSlotAuto()
      watch.destroy()
    })

    describe('Batch unwatched State updates', () => {
      // RuneHub
      const hub = new Hub()
      const shState = () => 0
      const shSlot = new Slot(() => 0)

      const hubAction = () => batch(() => {
        for (let i = 0; i < 10; i++) {
          set(shState, raw(shState) + 1)
        }
      })

      const slotAction = () => shSlot.hub.batch(() => {
        for (let i = 0; i < 10; i++) {
          shSlot.value = shSlot.raw + 1
        }
      })

      hub.use(() => {
        test('RuneHub: Rune', () => hubAction(), { highlight: true })
      })

      hub.destroy()

      test('RuneHub: Slot', () => slotAction(), { highlight: true })

      // watch-state
      const state = new State(0)

      const stateAction = () => callEvent(() => {
        for (let i = 0; i < 10; i++) {
          state.value = state.raw + 1
        }
      })

      test('watch-state', () => stateAction())

      // Zustand
      const zStore = createZStore(() => ({
        bears: 0,
      }))

      const zAction = () => {
        for (let i = 0; i < 10; i++) {
          zStore.setState({ bears: zStore.getState().bears + 1 })
        }
      }

      test('Zustand', () => zAction())

      // Nano Stores
      const nanoStore = atom(0)

      const nanoAction = () => {
        for (let i = 0; i < 10; i++) {
          nanoStore.set(nanoStore.get() + 1)
        }
      }

      test('Nano Stores', () => nanoAction())

      // Jotai
      const jotaiStore = createJotaiStore()
      const jotaiState = jotai(0)

      const jotaiAction = () => {
        for (let i = 0; i < 10; i++) {
          jotaiStore.set(jotaiState, c => c + 1)
        }
      }

      test('Jotai', () => jotaiAction())

      // Effector
      const incrementEffector = createEffectorEvent()
      createEffectorStore(0).on(incrementEffector, s => s + 1)

      const effectorAction = () => {
        for (let i = 0; i < 10; i++) {
          incrementEffector()
        }
      }

      test('Effector', () => effectorAction())

      // MobX
      const mobxState = observable.box(0)

      const mobxAction = action(() => {
        for (let i = 0; i < 10; i++) {
          mobxState.set(mobxState.get() + 1)
        }
      })

      test('MobX', () => mobxAction())

      // Redux
      const reduxStore = createStore((s: number = 0, a) => a.type === 'inc' ? s + 1 : s)

      const reduxAction = () => {
        for (let i = 0; i < 10; i++) {
          reduxStore.dispatch({ type: 'inc' })
        }
      }

      test('Redux', () => reduxAction())
    })
  })
}
