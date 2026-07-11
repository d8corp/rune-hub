import type {
  StoreWritable, Subscription,
} from 'effector'
import {
  createEvent as createEffectorEvent,
  createStore as createEffectorStore,
} from 'effector'
import { atom as jotai, createStore as createJotaiStore } from 'jotai/vanilla'
import type { PrimitiveAtom } from 'jotai/vanilla/atom'
import type { IObservableValue, IReactionDisposer } from 'mobx'
import { autorun, observable } from 'mobx'
import type { PreinitializedWritableAtom } from 'nanostores'
import { atom } from 'nanostores'
import { describe, test } from 'perfocode'
import type { Unsubscribe } from 'redux'
import { createStore } from 'redux'
import { State, Watch } from 'watch-state'
import type { StoreApi } from 'zustand/vanilla'
import { createStore as createZStore } from 'zustand/vanilla'

import type { Rune } from '../src'
import { get, Hub, on, raw, set, Slot } from '../src'

export function examplesTests () {
  describe('Examples', () => {
    describe('Counter', () => {
      const counter = (COUNT: number, SUBSCRIPTIONS = 1, STATES = 1) => {
        const statesArray = [...new Array(STATES)]
        const subscriptionsArray = [...new Array(SUBSCRIPTIONS)]

        const testLog = (log: number[]) => {
          if (log.length < COUNT * SUBSCRIPTIONS) {
            throw Error(`test failed: log.length expected: ${COUNT * SUBSCRIPTIONS}, actual: ${log.length}`)
          }

          for (let i = 0; i < log.length; i++) {
            if (log[i] !== COUNT - Math.floor(i / SUBSCRIPTIONS)) {
              throw Error(`test failed: log[${i}] expected: ${COUNT - Math.floor(i / SUBSCRIPTIONS)}, actual: ${log[i]}`)
            }
          }
        }

        function run <T, D> (
          create: (initial: number) => T,
          get: (state: T) => number,
          sub: (log: () => void, state: T) => D,
          action: (state: T) => boolean,
          destroy: (unsub: D) => void,
          autorun = false,
        ) {
          const log: number[] = []

          const states = statesArray.map(() => create(COUNT))

          if (!autorun) {
            for (let i = 0; i < SUBSCRIPTIONS; i++) {
              states.forEach((state) => {
                log.push(get(state))
              })
            }
          }

          const subscriptions = subscriptionsArray.flatMap(() => states.map(state => sub(() => {
            log.push(get(state))
          }, state)))

          for (const state of states) {
            while (action(state)) { /* empty */ }
          }

          testLog(log)
          subscriptions.forEach(destroy)
        }

        test('RuneHub: Rune event', () => {
          const hub = new Hub()

          hub.use(() => {
            run<Rune<number>, () => void>(
              (initial) => () => initial,
            state => raw(state),
            (log, state) => on(state, 'change', log),
            (state) => {
              const value = raw(state)
              set(state, value - 1)

              return Boolean(value)
            },
            (destroy) => destroy(),
            )
          })
        }, { highlight: true })

        test('RuneHub: Rune effect', () => {
          const hub = new Hub()

          hub.use(() => {
            run<Rune<number>, () => void>(
              (initial) => () => initial,
            state => get(state),
            (log) => on(log),
            (state) => {
              const value = raw(state)
              set(state, value - 1)

              return Boolean(value)
            },
            (destroy) => destroy(),
            true,
            )
          })
        }, { highlight: true })

        test('RuneHub: Slot event', () => {
          run<Slot<number>, () => void>(
            (initial) => new Slot(() => initial),
          state => state.raw,
          (log, state) => state.on('change', log),
          (state) => {
            const value = state.raw
            state.value = value - 1

            return Boolean(value)
          },
          (destroy) => destroy(),
          )
        }, { highlight: true })

        test('RuneHub: Slot effect', () => {
          run<Slot<number>, () => void>(
            (initial) => new Slot(() => initial),
          state => state.value,
          (log) => new Slot(log).on(),
          (state) => {
            const value = state.raw
            state.value = value - 1

            return Boolean(value)
          },
          (destroy) => destroy(),
          true,
          )
        }, { highlight: true })

        test('MobX', () => {
          run<IObservableValue<number>, IReactionDisposer>(
            (initial) => observable.box(initial),
            state => state.get(),
            (log) => autorun(log),
            (state) => {
              const value = state.get()
              state.set(value - 1)

              return Boolean(value)
            },
            (destroy) => destroy(),
            true,
          )
        })

        test('Redux', () => {
          function reducer (state: any, action: any) {
            if (action.type === 'DECREMENT') {
              return { ...state, [`count${action.payload}`]: state[`count${action.payload}`] - 1 }
            }

            return state
          }

          const store = createStore(reducer, [...new Array(STATES)].reduce((result, _, index) => {
            result[`count${index}`] = COUNT

            return result
          }, {}))

          let id = 0

          run<number, Unsubscribe>(
            () => id++,
            state => store.getState()[`count${state}`],
            (log) => store.subscribe(log),
            (state) => {
              const value = store.getState()[`count${state}`]
              store.dispatch({ type: 'DECREMENT', payload: state })

              return Boolean(value)
            },
            (destroy) => destroy(),
          )
        })

        test('Effector', () => {
          const decrement = createEffectorEvent()

          run<StoreWritable<number>, Subscription>(
            (initial) => createEffectorStore(initial).on(decrement, state => state - 1),
            state => state.getState(),
            (log, state) => state.watch(log),
            (state) => {
              const value = state.getState()
              decrement()

              return Boolean(value)
            },
            (destroy) => destroy(),
            true,
          )
        })

        test('Nano Stores', () => {
          run<PreinitializedWritableAtom<number>, () => void>(
            (initial) => atom(initial),
          state => state.get(),
          (log, state) => state.subscribe(log),
          (state) => {
            const value = state.get()
            state.set(value - 1)

            return Boolean(value)
          },
          (destroy) => destroy(),
          true,
          )
        })

        test('Jotai', () => {
          const store = createJotaiStore()

          run<PrimitiveAtom<number>, () => void>(
            (initial) => jotai(initial),
          state => store.get(state),
          (log, state) => store.sub(state, log),
          (state) => {
            const value = store.get(state)
            store.set(state, value - 1)

            return Boolean(value)
          },
          (destroy) => destroy(),
          )
        })

        test('watch-state', () => {
          run<State<number>, () => void>(
            (initial) => new State(initial),
          state => state.value,
          (log) => {
            const watch = new Watch(log)

            return () => watch.destroy()
          },
          (state) => {
            const value = state.raw
            state.value = value - 1

            return Boolean(value)
          },
          (destroy) => destroy(),
          true,
          )
        })

        test('Zustand', () => {
          run<StoreApi<{ count: number }>, () => void>(
            (initial) => createZStore(() => ({ count: initial })),
          state => state.getState().count,
          (log, state) => state.subscribe(log),
          (state) => {
            const value = state.getState().count
            state.setState({ count: value - 1 })

            return Boolean(value)
          },
          (destroy) => destroy(),
          )
        })
      }

      describe('1 Subscription', () => {
        describe('Counter 1 change 1 subscription', () => {
          counter(1)
        })

        describe('Counter 100 changes 1 subscription', () => {
          counter(100)
        })
      })

      describe('2 Subscription', () => {
        describe('Counter 1 change 2 subscriptions', () => {
          counter(1, 2)
        })

        describe('Counter 100 changes 2 subscriptions', () => {
          counter(100, 2)
        })
      })

      describe('100 subscription', () => {
        describe('Counter 1 change 100 subscriptions', () => {
          counter(1, 100)
        })

        describe('Counter 100 changes 100 subscriptions', () => {
          counter(100, 100)
        })

        describe('Counter 500 changes 100 subscriptions', () => {
          counter(500, 100)
        })
      })

      // describe('100 states', () => {
      //   describe('Counter 1 states 100 subscription', () => {
      //     counter(1, 100, 100)
      //   })
      //
      //   describe('Counter 100 states 100 subscription', () => {
      //     counter(100, 100, 100)
      //   })
      //
      //   describe('Counter 500 states 100 subscription', () => {
      //     counter(100, 1, 100)
      //   })
      // })
    })
  })
}
