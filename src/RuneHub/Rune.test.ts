import { batch, destroy, get, Hub, off, on, raw, set, Slot, update } from '..'
import type { Listener, Rune } from '.'

describe('Rune', () => {
  describe('Rune Name', () => {
    it('Should has state name', () => {
      const runeName: Rune = () => {}
      const listenerName: Listener = () => {}

      expect(runeName.name).toBe('runeName')
      expect(listenerName.name).toBe('listenerName')
    })

    it('Should keep state name as another variable', () => {
      const count: Rune<number> = () => 0
      const state = count

      expect(state.name).toBe('count')
    })

    it('Should keep state name as an argument', () => {
      const count: Rune<number> = () => 0

      const getName = (slot: Rune) => {
        return slot.name
      }

      expect(getName(count)).toBe('count')
    })

    it('Should keep state name as an object field', () => {
      const count: Rune<number> = () => 0

      const getName = ({ slot }: { slot: Rune }) => {
        return slot.name
      }

      expect(getName({ slot: count })).toBe('count')
    })
  })

  describe('constructor', () => {
    it('Should has no throw', () => {
      expect(() => new Hub()).not.toThrow()
    })
  })

  describe('raw', () => {
    it('Should return raw value', () => {
      const count: Rune<boolean> = () => true

      expect(raw(count)).toBe(true)
    })

    it('Should return computed value', () => {
      const count: Rune<number> = () => 2
      const double: Rune<number> = () => get(count) * 2

      expect(raw(double)).toBe(4)
    })

    it('Should have right value with computed', () => {
      const count1 = () => 0
      const count2 = () => 1
      const count3 = () => get(count2) + 1
      const log: number[][] = []

      const watchBoth = () => {
        log.push([get(count1), get(count2), raw(count3)])
      }

      const bind = () => {
        set(count2, get(count1) + 1)
      }

      on(bind)
      on(watchBoth)

      expect(log).toEqual([[0, 1, 2]])

      set(count1, 1)

      expect(log).toEqual([[0, 1, 2], [1, 2, 3]])
    })
  })

  describe('get', () => {
    it('Should return value', () => {
      const count = () => true

      expect(get(count)).toBe(true)
    })
  })

  describe('set', () => {
    it('Should sets value', () => {
      const count = () => true

      expect(raw(count)).toBe(true)

      set(count, false)

      expect(raw(count)).toBe(false)
    })
  })

  describe('on', () => {
    describe('Effects', () => {
      it('Should execute effect and respond to value changes', () => {
        const log: number[] = []

        const count = () => 0
        const effect = () => log.push(get(count))

        on(effect)
        expect(log).toEqual([0])

        set(count, 1)
        expect(log).toEqual([0, 1])

        set(count, 2)
        expect(log).toEqual([0, 1, 2])
      })

      it('Should return callback to turn off itself', () => {
        const log: number[] = []

        const count = () => 0
        const effect = () => log.push(get(count))

        const offEffect = on(effect)
        expect(log).toEqual([0])

        set(count, 1)
        expect(log).toEqual([0, 1])

        offEffect()
        expect(log).toEqual([0, 1])

        set(count, 3)
        expect(log).toEqual([0, 1])
      })

      it('Should update observers only once with source changing in an effect', () => {
        const log: number[][] = []

        const count1 = () => 0
        const count2 = () => 1

        const bindEffect = () => set(count2, get(count1) + 1)
        const watchEffect = () => log.push([get(count1), get(count2)])

        on(bindEffect)
        on(watchEffect)
        expect(log).toEqual([[0, 1]])

        set(count1, 1)
        expect(log).toEqual([[0, 1], [1, 2]])
      })

      it('Should update observers only once with source changing in invert order of effects', () => {
        const log: number[][] = []

        const count1 = () => 0
        const count2 = () => 1

        const watchEffect = () => log.push([get(count1), get(count2)])
        const bindEffect = () => set(count2, get(count1) + 1)

        on(watchEffect)
        on(bindEffect)

        set(count1, 1)

        expect(log).toEqual([[0, 1], [1, 2]])
      })

      it('Should subscribe on value changes', () => {
        const count = () => 0

        const log: number[] = []

        const logger = () => log.push(get(count))

        on(logger)
        expect(log).toEqual([0])

        set(count, 1)
        expect(log).toEqual([0, 1])

        set(count, 2)
        expect(log).toEqual([0, 1, 2])
      })

      it('Should returns unsubscribe', () => {
        const count = () => 0

        const log: number[] = []

        const logger = () => log.push(get(count))

        const unsubscribe = on(logger)

        expect(log).toEqual([0])

        set(count, 1)

        expect(log).toEqual([0, 1])

        set(count, 2)

        expect(log).toEqual([0, 1, 2])

        unsubscribe()

        expect(log).toEqual([0, 1, 2])

        set(count, 3)

        expect(log).toEqual([0, 1, 2])
      })

      it('Should work with loop of self subscription', () => {
        const count = () => 0
        const log: number[] = []

        const effect = () => {
          const value = get(count)

          if (value < 3) {
            log.push(value)
            set(count, value + 1)
          }
        }

        on(effect)
        expect(log).toEqual([0, 1, 2])

        update(count)
        expect(log).toEqual([0, 1, 2])
      })

      it('Should unsubscribe automatically', () => {
        const log: number[] = []
        let called = 0

        const streaming = () => true
        const count = () => 1

        const effect = () => {
          called++

          if (get(streaming)) {
            log.push(get(count))
          }
        }

        on(effect)
        expect(called).toBe(1)
        expect(log).toEqual([1])

        set(count, 2)
        expect(called).toBe(2)
        expect(log).toEqual([1, 2])

        set(streaming, false)
        expect(called).toBe(3)
        expect(log).toEqual([1, 2])

        set(count, 3)
        expect(called).toBe(3)
        expect(log).toEqual([1, 2])
      })

      it('Should prevent double call with two effects set one state', () => {
        const log: number[] = []
        const count = () => 0
        const value = () => 0

        const addEffect = () => set(value, get(count) + 1)
        const removeEffect = () => set(value, get(count) - 1)
        const logEffect = () => log.push(get(value))

        on(logEffect)
        expect(log).toEqual([0])

        on(addEffect)
        expect(log).toEqual([0, 1])

        on(removeEffect)
        expect(log).toEqual([0, 1, -1])

        set(count, 1)
        expect(log).toEqual([0, 1, -1, 0])
      })

      it('Should reactivate effects', () => {
        const log: number[] = []
        const count = () => 0

        const effect = () => {
          log.push(get(count))
        }

        on(effect)

        expect(log).toEqual([0])

        off(effect)
        on(effect)

        expect(log).toEqual([0, 0])
      })

      it('Should keep active with several activations', () => {
        const log: number[] = []
        const count = () => 0

        const effect = () => {
          log.push(get(count))
        }

        const stop1 = on(effect)
        const stop2 = on(effect)

        set(count, 1)

        expect(log).toEqual([0, 1])

        stop1()
        set(count, 2)

        expect(log).toEqual([0, 1, 2])

        stop2()
        set(count, 2)

        expect(log).toEqual([0, 1, 2])
      })

      it('Should auto-deactivate when single activation calls itself', () => {
        const log: number[] = []
        const count = () => 0

        const effect = () => {
          log.push(get(count))
        }

        const stop = on(effect)
        expect(log).toEqual([0])

        stop()
        expect(log).toEqual([0])

        set(count, 1)
        expect(log).toEqual([0])
      })

      it('Should handle self-deactivation directly via Slot.on()', () => {
        const slot = new Slot(() => 1)

        const activation = slot.on()
        expect(slot.up).toBe(true)
        expect(slot.activity.size).toBe(1)

        activation()
        expect(slot.up).toBe(false)
        expect(slot.activity.size).toBe(0)
      })
    })

    describe('Events', () => {
      describe('change', () => {
        it('Should not call change event for inactive rune', () => {
          const log: number[] = []
          const count = () => 1

          const listener = () => log.push(raw(count))

          on(count, 'change', listener)

          expect(log).toEqual([])

          set(count, 2)
          expect(log).toEqual([2])

          set(count, 3)
          expect(log).toEqual([2, 3])
        })

        it('Should call change events when rune is up', () => {
          const log: number[] = []
          const count = () => 1

          const listener = () => log.push(raw(count))

          on(count, 'change', listener)
          on(count)

          expect(log).toEqual([])

          set(count, 2)
          expect(log).toEqual([2])

          set(count, 3)
          expect(log).toEqual([2, 3])
        })

        it('Should unsubscribe from change event', () => {
          const log: number[] = []
          const count = () => 1

          const off = on(count, 'change', () => {
            log.push(raw(count))
          })

          on(count)

          expect(log).toEqual([])

          set(count, 2)
          expect(log).toEqual([2])

          off()

          set(count, 3)
          expect(log).toEqual([2])
        })

        it('Should not trigger change event for inactive computed rune', () => {
          const log: number[] = []
          const count = () => 1
          const double = () => get(count) * 2

          on(double, 'change', () => log.push(raw(double)))

          expect(log).toEqual([])

          set(count, 2)
          expect(log).toEqual([])

          set(count, 3)
          expect(log).toEqual([])
        })

        it('Should unsubscribe correct listener from change event', () => {
          const log: [number, number][] = []
          const count1 = () => 1
          const count2 = () => 1

          const listener = () => log.push([raw(count1), raw(count2)])

          const off1 = on(count1, 'change', listener)
          const off2 = on(count2, 'change', listener)

          on(count1)
          on(count2)

          expect(log).toEqual([])

          set(count1, 2)
          expect(log).toEqual([[2, 1]])

          set(count2, 2)
          expect(log).toEqual([[2, 1], [2, 2]])

          off1()

          set(count1, 3)
          expect(log).toEqual([[2, 1], [2, 2]])

          set(count2, 3)
          expect(log).toEqual([[2, 1], [2, 2], [3, 3]])

          off2()

          set(count1, 4)
          set(count2, 4)
          expect(log).toEqual([[2, 1], [2, 2], [3, 3]])
        })

        it('Should trigger listener when value changes', () => {
          const log: number[] = []
          const count = () => 1

          const listener = () => log.push(raw(count))

          on(count, 'change', listener)

          expect(log).toEqual([])

          set(count, 2)
          expect(log).toEqual([2])

          set(count, 3)
          expect(log).toEqual([2, 3])
        })

        it('Should unsubscribe listener and stop triggering', () => {
          const log: number[] = []
          const count = () => 1

          const listener = () => log.push(raw(count))

          const unsubscribe = on(count, 'change', listener)

          expect(log).toEqual([])

          set(count, 2)
          expect(log).toEqual([2])

          unsubscribe()

          set(count, 3)
          expect(log).toEqual([2])
        })

        it('Should trigger listener for computed rune when dependencies change', () => {
          const log: number[] = []
          const count = () => 1
          const double = () => get(count) * 2

          const listener = () => log.push(raw(double))

          on(double, 'change', listener)
          on(double)

          expect(log).toEqual([])

          set(count, 2)
          expect(log).toEqual([4])

          set(count, 3)
          expect(log).toEqual([4, 6])
        })

        it('Should unsubscribe correct listener', () => {
          const log: [number, number][] = []
          const count1 = () => 1
          const count2 = () => 1

          const listener = () => log.push([raw(count1), raw(count2)])

          const unsubscribe1 = on(count1, 'change', listener)
          const unsubscribe2 = on(count2, 'change', listener)

          expect(log).toEqual([])

          set(count1, 2)
          expect(log).toEqual([[2, 1]])

          set(count2, 2)
          expect(log).toEqual([[2, 1], [2, 2]])

          unsubscribe1()

          set(count1, 3)
          expect(log).toEqual([[2, 1], [2, 2]])

          set(count2, 3)
          expect(log).toEqual([[2, 1], [2, 2], [3, 3]])

          unsubscribe2()

          set(count1, 4)
          set(count2, 4)
          expect(log).toEqual([[2, 1], [2, 2], [3, 3]])
        })

        it('Should prevent double call with two listeners set one state', () => {
          const log: number[] = []
          const count = () => -1
          const value = () => 0

          set(count, 0)

          const addEffect = () => {
            set(value, raw(count) + 1)
          }

          const removeEffect = () => {
            set(value, raw(count) - 1)
          }

          const logEffect = () => {
            log.push(get(value))
          }

          on(logEffect)
          expect(log).toEqual([0])

          on(count, 'change', addEffect)
          on(count, 'change', removeEffect)
          expect(log).toEqual([0])

          set(count, 1)
          expect(log).toEqual([0])
          expect(raw(value)).toEqual(0)
        })
      })

      describe('init', () => {
        it('Should trigger init event when rune is first accessed', () => {
          const log: string[] = []
          const count = () => 1

          on(count, 'init', () => log.push('init'))

          expect(log).toEqual([])

          raw(count)

          expect(log).toEqual(['init'])
        })

        it('Should not trigger up event on set', () => {
          const log: string[] = []
          const count = () => 1

          on(count, 'up', () => log.push('up'))

          get(count)
          set(count, 2)
          get(count)

          expect(log).toEqual([])
        })
      })

      describe('call', () => {
        it('Should trigger call event when rune is up', () => {
          const log: string[] = []
          const count = () => 1

          on(count, 'call', () => log.push('call'))
          expect(log).toEqual([])

          get(count)
          expect(log).toEqual(['call'])
        })
      })

      describe('update', () => {
        it('Should trigger update event when value is set', () => {
          const log: string[] = []
          const count = () => 1

          on(count, 'update', () => log.push('update'))
          expect(log).toEqual([])

          set(count, 2)
          expect(log).toEqual(['update'])
        })

        it('Should not trigger update on setting same value', () => {
          const log: string[] = []
          const count = () => 1

          on(count, 'update', () => log.push('update'))

          set(count, 1)
          expect(log).toEqual([])

          set(count, 2)
          expect(log).toEqual(['update'])
        })
      })

      describe('clear', () => {
        it('Should trigger clear event when dependencies change', () => {
          const log: string[] = []
          const count = () => 1
          const double = () => get(count) * 2

          on(double, 'clear', () => log.push('clear'))

          const effect = () => get(double)
          on(effect)

          expect(log).toEqual([])

          set(count, 2)

          expect(log).toEqual(['clear'])

          set(count, 3)

          expect(log).toEqual(['clear', 'clear'])
        })

        it('Should support cleanup pattern', () => {
          const log: string[] = []
          const count = () => 1

          const effect = () => {
            log.push(`setup:${get(count)}`)

            const clean = on(effect, 'clear', () => {
              log.push('cleanup')
              clean()
            })
          }

          on(effect)
          expect(log).toEqual(['setup:1'])

          set(count, 2)
          expect(log).toEqual(['setup:1', 'cleanup', 'setup:2'])

          set(count, 3)
          expect(log).toEqual(['setup:1', 'cleanup', 'setup:2', 'cleanup', 'setup:3'])
        })
      })

      describe('destroy', () => {
        it('Should trigger destroy event', () => {
          const count: Rune<number> = () => 1
          const log: string[] = []

          on(count, 'destroy', () => log.push('destroy'))
          expect(log).toEqual([])

          destroy(count)
          expect(log).toEqual(['destroy'])
        })
      })
    })
  })

  describe('compute', () => {
    it('Should subscribe on value changes', () => {
      const log: number[] = []
      const computeLog: number[] = []

      const count = () => 1

      const double = () => {
        const value = get(count) * 2
        computeLog.push(value)

        return value
      }

      const doubleListener = () => log.push(get(double))

      on(doubleListener)

      expect(log).toEqual([2])
      expect(computeLog).toEqual([2])

      set(count, 2)

      expect(log).toEqual([2, 4])
      expect(computeLog).toEqual([2, 4])

      expect(raw(double)).toBe(4)

      expect(log).toEqual([2, 4])
      expect(computeLog).toEqual([2, 4])

      set(count, 3)

      expect(log).toEqual([2, 4, 6])
      expect(computeLog).toEqual([2, 4, 6])

      expect(raw(double)).toBe(6)
    })

    it('Should call once for 2 subscription', () => {
      const log: number[] = []
      const computeLog: number[] = []

      const count = () => 1

      const double = () => {
        const value = get(count) + get(count)
        computeLog.push(value)

        return value
      }

      const doubleListener = () => log.push(get(double))

      on(doubleListener)
      on(doubleListener)

      expect(log).toEqual([2])
      expect(computeLog).toEqual([2])

      set(count, 2)

      expect(log).toEqual([2, 4])
      expect(computeLog).toEqual([2, 4])

      expect(raw(double)).toBe(4)

      expect(log).toEqual([2, 4])
      expect(computeLog).toEqual([2, 4])

      set(count, 3)

      expect(log).toEqual([2, 4, 6])
      expect(computeLog).toEqual([2, 4, 6])

      expect(raw(double)).toBe(6)
    })

    it('Should prevent subscription call with the same result', () => {
      const log: string[] = []
      const name = () => 'Foo'
      const surname = () => 'Boo'
      const fullName = () => `${get(name)} ${get(surname)[0]}.`

      const fullNameListener = () => log.push(get(fullName))

      on(fullNameListener)

      expect(log).toEqual(['Foo B.'])
      expect(raw(fullName)).toEqual('Foo B.')
      expect(log).toEqual(['Foo B.'])

      set(surname, 'Baz')

      expect(log).toEqual(['Foo B.'])
      expect(raw(fullName)).toEqual('Foo B.')
      expect(log).toEqual(['Foo B.'])

      set(surname, 'Mike')

      expect(log).toEqual(['Foo B.', 'Foo M.'])
      expect(raw(fullName)).toEqual('Foo M.')
      expect(log).toEqual(['Foo B.', 'Foo M.'])
    })

    it('Should stop calculation without subscribers', () => {
      const log: number[] = []
      const listenerLog: number[] = []

      const count = () => 1

      const double = () => {
        const value = get(count) + get(count)
        log.push(value)

        return value
      }

      const unsubscribe = on(() => listenerLog.push(get(double)))

      expect(log).toEqual([2])
      expect(listenerLog).toEqual([2])

      set(count, 2)

      expect(log).toEqual([2, 4])
      expect(listenerLog).toEqual([2, 4])

      unsubscribe()

      set(count, 3)

      expect(listenerLog).toEqual([2, 4])
      expect(log).toEqual([2, 4])
    })

    it('Should stop deep calculation without subscribers', () => {
      const log: number[] = []
      const listenerLog: string[] = []
      const strLog: string[] = []

      const count = () => 1

      const double = () => {
        const value = get(count) + get(count)
        log.push(value)

        return value
      }

      const str = () => {
        const value = String(get(double))
        strLog.push(value)

        return value
      }

      const unsubscribe = on(() => listenerLog.push(get(str)))

      expect(log).toEqual([2])
      expect(strLog).toEqual(['2'])
      expect(listenerLog).toEqual(['2'])

      set(count, 2)

      expect(log).toEqual([2, 4])
      expect(strLog).toEqual(['2', '4'])
      expect(listenerLog).toEqual(['2', '4'])

      unsubscribe()

      set(count, 3)

      expect(listenerLog).toEqual(['2', '4'])
      expect(strLog).toEqual(['2', '4'])
      expect(log).toEqual([2, 4])
    })

    it('Should not stop calculation on unsubscribe', () => {
      const doubleLog: number[] = []
      const strListenerLog: string[] = []
      const strLog: string[] = []
      const doubleListenerLog: number[] = []

      const count = () => 1

      const double = () => {
        const value = get(count) + get(count)
        doubleLog.push(value)

        return value
      }

      const str = () => {
        const value = String(get(double))
        strLog.push(value)

        return value
      }

      const doubleListener = () => {
        doubleListenerLog.push(get(double))
      }

      const strListener = () => {
        strListenerLog.push(get(str))
      }

      const unsubscribeStr = on(strListener)
      const unsubscribeDouble = on(doubleListener)

      expect(doubleLog).toEqual([2])
      expect(strLog).toEqual(['2'])
      expect(strListenerLog).toEqual(['2'])
      expect(doubleListenerLog).toEqual([2])

      set(count, 2)

      expect(doubleLog).toEqual([2, 4])
      expect(strLog).toEqual(['2', '4'])
      expect(strListenerLog).toEqual(['2', '4'])
      expect(doubleListenerLog).toEqual([2, 4])

      unsubscribeStr()

      set(count, 3)

      expect(strLog).toEqual(['2', '4'])
      expect(doubleLog).toEqual([2, 4, 6])
      expect(strListenerLog).toEqual(['2', '4'])
      expect(doubleListenerLog).toEqual([2, 4, 6])

      unsubscribeDouble()

      set(count, 4)

      expect(strLog).toEqual(['2', '4'])
      expect(doubleLog).toEqual([2, 4, 6])
      expect(strListenerLog).toEqual(['2', '4'])
      expect(doubleListenerLog).toEqual([2, 4, 6])
    })
  })

  describe('batch', () => {
    it('Should not throw on empty batching', () => {
      expect(() => batch(() => {})).not.toThrow()
    })

    it('Should not throw on call endBatching', () => {
      const hub = new Hub()

      expect(() => hub.endBatching()).not.toThrow()
    })

    it('Should batches states', () => {
      const log: number[] = []
      const count = () => 0

      on(() => log.push(get(count)))
      expect(log).toEqual([0])

      const action = () => {
        set(count, raw(count) + 1)
        set(count, raw(count) + 1)
      }

      batch(action)
      expect(log).toEqual([0, 2])

      batch(action)
      expect(log).toEqual([0, 2, 4])
    })

    it('Should handle nested batch actions', () => {
      const log: [number, number][] = []
      const count1 = () => 0
      const count2 = () => 0

      on(() => log.push([get(count1), get(count2)]))

      expect(log).toEqual([[0, 0]])

      const innerAction = () => {
        set(count1, raw(count1) + 1)
        set(count2, raw(count2) + 1)
      }

      const outerAction = () => {
        batch(innerAction)
        set(count1, raw(count1) + 1)
        set(count2, raw(count2) + 1)
      }

      batch(outerAction)

      expect(log).toEqual([[0, 0], [2, 2]])
    })

    it('Should process forced items in batch queue', () => {
      const log: number[] = []
      const count = () => 0

      const effect = () => {
        log.push(get(count))
      }

      on(effect)
      expect(log).toEqual([0])

      batch(() => {
        set(count, 1)
        update(count)
        set(count, 2)
      })

      expect(log).toEqual([0, 2])
    })
  })

  describe('off', () => {
    it('Should unsubscribe on value changes', () => {
      const count = () => 0

      const log: number[] = []

      const listener = () => log.push(get(count))

      on(listener)

      expect(log).toEqual([0])

      set(count, 1)

      expect(log).toEqual([0, 1])

      set(count, 2)

      expect(log).toEqual([0, 1, 2])

      off(listener)

      expect(log).toEqual([0, 1, 2])

      set(count, 3)

      expect(log).toEqual([0, 1, 2])
    })

    it('Should returns unsubscribe', () => {
      const count = () => 0

      const log: number[] = []

      const unsubscribe = on(() => log.push(get(count)))

      expect(log).toEqual([0])

      set(count, 1)

      expect(log).toEqual([0, 1])

      set(count, 2)

      expect(log).toEqual([0, 1, 2])

      unsubscribe()

      expect(log).toEqual([0, 1, 2])

      set(count, 3)

      expect(log).toEqual([0, 1, 2])
    })

    it('Should not throw on turning off unused rune', () => {
      const count = () => 1

      expect(() => off(count)).not.toThrow()
    })
  })

  describe('update', () => {
    it('Should update mutate array states', () => {
      const list = (): number[] => []
      const log: number[][] = []

      const listener = () => log.push([...get(list)])

      on(listener)
      expect(log).toEqual([[]])

      raw(list).push(1)
      raw(list).push(2)
      expect(log).toEqual([[]])

      update(list)
      expect(log).toEqual([[], [1, 2]])
    })

    it('Should not throw on update unused rune', () => {
      const count = () => 1

      expect(() => update(count)).not.toThrow()
    })
  })

  describe('destroy', () => {
    it('Should not throw when destroying non-existent slot via Hub', () => {
      const count: Rune<number> = () => 1

      expect(() => destroy(count)).not.toThrow()
    })
  })
})
