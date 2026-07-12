import { Hub, Slot } from '..'
import type { Rune } from '.'

describe('Slot', () => {
  describe('Slot Name', () => {
    it('Should has state name', () => {
      const runeName = () => {}
      const slotName = new Slot(runeName)

      expect(slotName.rune.name).toBe('runeName')
    })
  })

  describe('off with single subscriber', () => {
    it('Should turn off source when it has only one subscriber', () => {
      const log: string[] = []

      const source = new Slot(() => {
        log.push('source computed')

        return 1
      })

      const derived = new Slot(() => {
        return source.value * 2
      })

      derived.on()
      expect(log).toEqual(['source computed'])
      expect(source.up).toBe(true)

      derived.off()
      expect(source.up).toBe(false)
    })

    it('Should not turn off source when it has multiple subscribers', () => {
      const source = new Slot(() => 1)
      const derived1 = new Slot(() => source.value * 2)
      const derived2 = new Slot(() => source.value * 3)

      derived1.on()
      derived2.on()
      expect(source.up).toBe(true)

      derived1.off()
      expect(source.up).toBe(true)

      derived2.off()
      expect(source.up).toBe(false)
    })

    it('Should recursively turn off source chain with single subscribers', () => {
      const a = new Slot(() => 1)
      const b = new Slot(() => a.value * 2)
      const c = new Slot(() => b.value * 2)

      c.on()
      expect(a.up).toBe(true)
      expect(b.up).toBe(true)
      expect(c.up).toBe(true)

      c.off()
      expect(a.up).toBe(false)
      expect(b.up).toBe(false)
      expect(c.up).toBe(false)
    })
  })

  describe('constructor', () => {
    it('Should has no throw', () => {
      expect(() => new Slot(() => {})).not.toThrow()
    })
  })

  describe('raw', () => {
    it('Should return raw value', () => {
      const count = new Slot(() => true)

      expect(count.raw).toBe(true)
    })

    it('Should return computed value', () => {
      const count = new Slot(() => 2)
      const double = new Slot(() => count.value * 2)

      expect(double.raw).toBe(4)
    })

    it('Should update raw value of computed slots when source changes', () => {
      const log: number[][] = []
      const count1 = new Slot(function count1 () { return 0 })
      const count2 = new Slot(function count2 () { return 1 })

      const count3 = new Slot(function count3 () {
        return count2.value + 1
      })

      const bind = new Slot(function bind () {
        count2.set(count1.value + 1)
      })

      const watchBoth = new Slot(function watchBoth () {
        log.push([count1.value, count2.value, count3.raw])
      })

      bind.on()
      watchBoth.on()
      expect(log).toEqual([[0, 1, 2]])

      count1.set(1)

      expect(log).toEqual([[0, 1, 2], [1, 2, 3]])
    })
  })

  describe('get', () => {
    it('Should return value', () => {
      const count = new Slot(() => true)

      expect(count.value).toBe(true)
    })

    it('Should resolve safety computed loop dependencies in queue', () => {
      const log: number[] = []
      const count = new Slot(function count () { return 1 })

      const double = new Slot(function double () {
        if (count.value < 4) {
          count.value++
        }

        return count.value * 2
      })

      const effect = new Slot(function effect () {
        log.push(double.value)
      })

      effect.on()

      expect(log).toEqual([8])

      count.set(2)

      expect(log).toEqual([8])

      count.set(5)

      expect(log).toEqual([8, 10])

      count.set(1)

      expect(log).toEqual([8, 10, 8])
    })

    it('Should resolve safety computed deep dependencies in queue', () => {
      const log: string[] = []
      const count = new Slot(() => 1)
      const double = new Slot(() => count.value * 2)
      const value = new Slot(() => String(double.value))

      new Slot(() => {
        log.push(`${count.value}: ${value.value}`)
      }).on()

      expect(log).toEqual(['1: 2'])

      count.set(2)

      expect(log).toEqual(['1: 2', '2: 4'])

      count.set(3)

      expect(log).toEqual(['1: 2', '2: 4', '3: 6'])
    })
  })

  describe('set', () => {
    it('Should sets value', () => {
      const count = new Slot(() => true)

      expect(count.raw).toBe(true)

      count.set(false)

      expect(count.raw).toBe(false)
    })
  })

  describe('on', () => {
    describe('Effects', () => {
      it('Should subscribe on value changes', () => {
        const count = new Slot(() => 0)

        const log: number[] = []

        const logCountEffect = new Slot(() => {
          log.push(count.value)
        })

        logCountEffect.on()

        expect(log).toEqual([0])

        count.value++

        expect(log).toEqual([0, 1])

        count.value++

        expect(log).toEqual([0, 1, 2])

        count.value++

        expect(log).toEqual([0, 1, 2, 3])
      })

      it('Should unsubscribe with off method', () => {
        const count = new Slot(() => 0)
        const log: number[] = []

        const logEffect = new Slot(() => {
          log.push(count.value)
        })

        expect(log).toEqual([])

        logEffect.on()
        expect(log).toEqual([0])

        count.value++
        expect(log).toEqual([0, 1])

        logEffect.off()
        expect(log).toEqual([0, 1])

        count.value++
        expect(log).toEqual([0, 1])
      })

      it('Should return callback to turn off itself', () => {
        const log: number[] = []

        const count = new Slot(() => 0)

        const logEffect = new Slot(() => {
          log.push(count.value)
        })

        const off = logEffect.on()
        expect(log).toEqual([0])

        count.value = 1
        expect(log).toEqual([0, 1])

        off()
        expect(log).toEqual([0, 1])

        count.value = 3
        expect(log).toEqual([0, 1])
      })

      it('Should update observers only once with source changing in an effect', () => {
        const log: number[][] = []

        const count1 = new Slot(() => 0)
        const count2 = new Slot(() => 1)

        const effect = new Slot(() => {
          count2.value = count1.value + 1
        })

        const watchBoth = new Slot(() => {
          log.push([count1.value, count2.value])
        })

        effect.on()
        watchBoth.on()
        expect(log).toEqual([[0, 1]])

        count1.value++
        expect(log).toEqual([[0, 1], [1, 2]])
      })

      it('Should update observers only once with source changing in invert order of effects', () => {
        const log: number[][] = []

        const count1 = new Slot(() => 0)
        const count2 = new Slot(() => 1)

        const watchBoth = new Slot(() => {
          log.push([count1.value, count2.value])
        })

        const effect = new Slot(() => {
          count2.value = count1.value + 1
        })

        watchBoth.on()
        effect.on()
        expect(log).toEqual([[0, 1]])

        count1.value++
        expect(log).toEqual([[0, 1], [1, 2]])
      })

      it('Should work with loop of self subscription', () => {
        const count = new Slot(() => 0)
        const log: number[] = []

        const countLoop = new Slot(() => {
          const value = count.value

          if (value < 3) {
            log.push(value)
            count.value++
          }
        })

        countLoop.on()
        expect(count.raw).toEqual(3)
        expect(log).toEqual([0, 1, 2])
      })

      it('Should react on second effects up', () => {
        const log: number[] = []
        const $count = () => 0
        const count = new Slot($count)

        const $effect = () => {
          log.push(count.value)
        }

        const effect = new Slot($effect)

        effect.on()

        expect(log).toEqual([0])

        effect.off()
        effect.on()

        expect(log).toEqual([0, 0])
      })
    })

    describe('Events', () => {
      describe('change', () => {
        it('Should call change event for inactive slot', () => {
          const log: number[] = []
          const count = new Slot(() => 1)

          const listener = () => {
            log.push(count.raw)
          }

          count.on('change', listener)

          expect(log).toEqual([])

          count.set(2)
          expect(log).toEqual([2])

          count.set(3)
          expect(log).toEqual([2, 3])
        })

        it('Should call change events when slot is up', () => {
          const log: number[] = []
          const count = new Slot(() => 1)

          const listener = () => {
            log.push(count.raw)
          }

          count.on('change', listener)
          count.on()

          expect(log).toEqual([])

          count.set(2)
          expect(log).toEqual([2])

          count.value = 3
          expect(log).toEqual([2, 3])
        })

        it('Should stop triggering change event after unsubscribe', () => {
          const log: number[] = []
          const count = new Slot(() => 1)

          const off = count.on('change', () => {
            log.push(count.raw)
          })

          count.on()

          expect(log).toEqual([])

          count.value = 2
          expect(log).toEqual([2])

          off()

          count.value = 3
          expect(log).toEqual([2])
        })

        it('Should not trigger change event on unbound computed slot', () => {
          const log: number[] = []
          const count = new Slot(() => 1)
          const double = new Slot(() => count.value * 2)

          double.on('change', () => {
            log.push(double.raw)
          })

          expect(log).toEqual([])

          count.value = 2
          expect(log).toEqual([])

          count.value = 3
          expect(log).toEqual([])
        })

        it('Should unsubscribe correct listener', () => {
          const log: [number, number][] = []
          const count1 = new Slot(() => 1)
          const count2 = new Slot(() => 1)

          const listener = () => {
            log.push([count1.raw, count2.raw])
          }

          const off1 = count1.on('change', listener)
          const off2 = count2.on('change', listener)

          count1.on()
          count2.on()

          expect(log).toEqual([])

          count1.value = 2
          expect(log).toEqual([[2, 1]])

          count2.value = 2
          expect(log).toEqual([[2, 1], [2, 2]])

          off1()

          count1.value = 3
          expect(log).toEqual([[2, 1], [2, 2]])

          count2.value = 3
          expect(log).toEqual([[2, 1], [2, 2], [3, 3]])

          off2()

          count1.value = 4
          count2.value = 4
          expect(log).toEqual([[2, 1], [2, 2], [3, 3]])
        })

        it('Should trigger listener on value change', () => {
          const log: number[] = []
          const count = new Slot(() => 1)

          const listener = () => {
            log.push(count.raw)
          }

          count.on('change', listener)

          expect(log).toEqual([])

          count.value = 2
          expect(log).toEqual([2])

          count.value = 3
          expect(log).toEqual([2, 3])
        })

        it('Should stop triggering listener after unsubscribe', () => {
          const log: number[] = []
          const count = new Slot(() => 1)

          const off = count.on('change', () => log.push(count.raw))

          expect(log).toEqual([])

          count.value = 2
          expect(log).toEqual([2])

          off()

          count.value = 3
          expect(log).toEqual([2])
        })

        it('Should work with computed', () => {
          const log: number[] = []
          const count = new Slot(() => 1)
          const double = new Slot(() => count.value * 2)

          double.on('change', () => log.push(double.raw))
          double.on()

          expect(log).toEqual([])

          count.value = 2
          expect(log).toEqual([4])

          count.value = 3
          expect(log).toEqual([4, 6])
        })

        it('Should unsubscribe correct listener', () => {
          const log: [number, number][] = []
          const count1 = new Slot(() => 1)
          const count2 = new Slot(() => 1)

          const listener = () => {
            log.push([count1.raw, count2.raw])
          }

          const off1 = count1.on('change', listener)
          const off2 = count2.on('change', listener)

          expect(log).toEqual([])

          count1.value = 2
          expect(log).toEqual([[2, 1]])

          count2.value = 2
          expect(log).toEqual([[2, 1], [2, 2]])

          off1()

          count1.value = 3
          expect(log).toEqual([[2, 1], [2, 2]])

          count2.value = 3
          expect(log).toEqual([[2, 1], [2, 2], [3, 3]])

          off2()

          count1.value = 4
          count2.value = 4
          expect(log).toEqual([[2, 1], [2, 2], [3, 3]])
        })

        it('Should work with self subscription', () => {
          const count = new Slot(() => 0)
          const log: number[] = []

          count.on('change', () => {
            const value = count.raw

            if (value < 5) {
              log.push(value)
              count.value++
            }
          })

          expect(log).toEqual([])

          count.set(1)
          expect(log).toEqual([1, 2, 3, 4])
        })
      })

      describe('init', () => {
        it('Should trigger up event when slot is first activated', () => {
          const log: string[] = []
          const count = new Slot(() => 1)

          count.on('init', () => {
            log.push('init')
          })

          expect(log).toEqual([])

          count.on()

          expect(log).toEqual(['init'])
        })

        it('Should trigger init event only once', () => {
          const log: string[] = []
          const count = new Slot(() => 1)

          count.on('init', () => {
            log.push('init')
          })

          count.on()()
          count.on()
          count.value = 2
          count.value = 3

          expect(log).toEqual(['init'])
        })
      })

      describe('call', () => {
        it('Should trigger call event when Slot\'s rune is called', () => {
          const log: string[] = []
          const count = new Slot(() => 1)

          count.on('call', () => {
            log.push('call')
          })

          expect(log).toEqual([])

          count.on()

          expect(log).toEqual(['call'])
        })

        it('Should not trigger call event on value change', () => {
          const log: string[] = []
          const count = new Slot(() => 1)

          count.on('call', () => {
            log.push('call')
          })

          count.on()

          expect(log).toEqual(['call'])

          count.value = 2

          expect(log).toEqual(['call'])
        })
      })

      describe('update', () => {
        it('Should trigger update event when value is set', () => {
          const log: string[] = []
          const count = new Slot(() => 1)

          count.on('update', () => {
            log.push('update')
          })

          expect(log).toEqual([])

          count.value = 2

          expect(log).toEqual(['update'])

          count.value = 3

          expect(log).toEqual(['update', 'update'])
        })

        it('Should trigger update event only on actual value change', () => {
          const log: string[] = []
          const count = new Slot(() => 1)

          count.on('update', () => {
            log.push('update')
          })

          count.value = 1

          expect(log).toEqual([])

          count.value = 2

          expect(log).toEqual(['update'])

          count.value = 2

          expect(log).toEqual(['update'])
        })
      })

      describe('up', () => {
        describe('state', () => {
          it('Should trigger up event', () => {
            const log: string[] = []
            const count = new Slot(() => 1)

            count.on('up', () => {
              log.push('up')
            })

            expect(log).toEqual([])

            new Slot(() => count.value).on()

            expect(log).toEqual(['up'])
          })

          it('Should not trigger up event', () => {
            const log: string[] = []
            const count = new Slot(() => 1)

            count.on('up', () => {
              log.push('up')
            })

            expect(log).toEqual([])

            new Slot(() => count.value).on()
            new Slot(() => count.value).on()

            expect(log).toEqual(['up'])
          })
        })
      })

      describe('down', () => {
        describe('state', () => {
          it('Should trigger down event', () => {
            const log: string[] = []
            const count = new Slot(() => 1)

            count.on('down', () => log.push('down'))

            const stop = new Slot(() => count.value).on()

            expect(log).toEqual([])

            stop()

            expect(log).toEqual(['down'])
          })

          it('Should not trigger down event', () => {
            const count = new Slot(() => 1)
            const log: string[] = []

            count.on('down', () => log.push('down'))

            expect(log).toEqual([])

            const stop1 = new Slot(() => count.value).on()
            new Slot(() => count.value).on()

            stop1()

            expect(log).toEqual([])
          })
        })
      })

      describe('destroy', () => {
        it('Should trigger destroy event', () => {
          const count = new Slot(() => 1)
          const log: string[] = []

          count.on('destroy', () => log.push('destroy'))
          expect(log).toEqual([])

          count.destroy()
          expect(log).toEqual(['destroy'])
        })
      })

      describe('clear', () => {
        it('Should not trigger clear event on destroy method for uninitialised Slot', () => {
          const count = new Slot(() => 1)
          const double = new Slot(() => count.value * 2)
          const log: string[] = []

          double.on('clear', () => log.push('clear'))
          expect(log).toEqual([])

          double.destroy()
          expect(log).toEqual([])
        })

        it('Should trigger clear event on destroy', () => {
          const count = new Slot(() => 1)
          const double = new Slot(() => count.value * 2)
          const log: string[] = []

          double.on('clear', () => log.push('clear'))
          expect(log).toEqual([])

          double.on()

          double.destroy()
          expect(log).toEqual(['clear'])
        })
      })
    })
  })

  describe('compute', () => {
    it('Should subscribe on value changes', () => {
      const log: number[] = []
      const computeLog: number[] = []

      const count = new Slot(() => 1)

      const double = new Slot(() => {
        const value = count.value * 2
        computeLog.push(value)

        return value
      })

      const doubleListener = new Slot(() => {
        log.push(double.value)
      })

      doubleListener.on()

      expect(log).toEqual([2])
      expect(computeLog).toEqual([2])

      count.set(2)

      expect(log).toEqual([2, 4])
      expect(computeLog).toEqual([2, 4])

      expect(double.raw).toBe(4)

      expect(log).toEqual([2, 4])
      expect(computeLog).toEqual([2, 4])

      count.value = 3

      expect(log).toEqual([2, 4, 6])
      expect(computeLog).toEqual([2, 4, 6])

      expect(double.raw).toBe(6)
    })

    it('Should call once for 2 subscription', () => {
      const log: number[] = []
      const computeLog: number[] = []

      const count = new Slot(() => 1)

      const double = new Slot(() => {
        const value = count.value + count.value
        computeLog.push(value)

        return value
      })

      const doubleListener = new Slot(() => {
        log.push(double.value)
      })

      doubleListener.on()
      doubleListener.on()

      expect(log).toEqual([2])
      expect(computeLog).toEqual([2])

      count.value = 2

      expect(log).toEqual([2, 4])
      expect(computeLog).toEqual([2, 4])

      expect(double.raw).toBe(4)

      expect(log).toEqual([2, 4])
      expect(computeLog).toEqual([2, 4])

      count.value = 3

      expect(log).toEqual([2, 4, 6])
      expect(computeLog).toEqual([2, 4, 6])

      expect(double.raw).toBe(6)
    })

    it('Should prevent subscription call with the same result', () => {
      const name = new Slot(() => 'Foo')
      const surname = new Slot(() => 'Boo')

      const fullName = new Slot(() => {
        return `${name.value} ${surname.value[0]}.`
      })

      const log: string[] = []

      const fullNameListener = new Slot(() => {
        log.push(fullName.value)
      })

      fullNameListener.on()

      expect(log).toEqual(['Foo B.'])
      expect(fullName.raw).toEqual('Foo B.')
      expect(log).toEqual(['Foo B.'])

      surname.value = 'Baz'

      expect(log).toEqual(['Foo B.'])
      expect(fullName.raw).toEqual('Foo B.')
      expect(log).toEqual(['Foo B.'])

      surname.value = 'Mike'

      expect(log).toEqual(['Foo B.', 'Foo M.'])
      expect(fullName.raw).toEqual('Foo M.')
      expect(log).toEqual(['Foo B.', 'Foo M.'])
    })

    it('Should stop calculation without subscribers', () => {
      const log: number[] = []
      const listenerLog: number[] = []

      const count = new Slot(() => 1)

      const double = new Slot(() => {
        const value = count.value + count.value
        log.push(value)

        return value
      })

      const listener = new Slot(() => {
        listenerLog.push(double.value)
      })

      const off = listener.on()

      expect(log).toEqual([2])
      expect(listenerLog).toEqual([2])

      count.value = 2

      expect(log).toEqual([2, 4])
      expect(listenerLog).toEqual([2, 4])

      off()

      count.value = 3

      expect(listenerLog).toEqual([2, 4])
      expect(log).toEqual([2, 4])
    })

    it('Should stop deep calculation without subscribers', () => {
      const log: number[] = []
      const listenerLog: string[] = []
      const strLog: string[] = []

      const count = new Slot(() => 1)

      const double = new Slot(() => {
        const value = count.value + count.value
        log.push(value)

        return value
      })

      const str = new Slot(() => {
        const value = String(double.value)
        strLog.push(value)

        return value
      })

      const listener = new Slot(() => {
        listenerLog.push(str.value)
      })

      const off = listener.on()

      expect(log).toEqual([2])
      expect(strLog).toEqual(['2'])
      expect(listenerLog).toEqual(['2'])

      count.value = 2

      expect(log).toEqual([2, 4])
      expect(strLog).toEqual(['2', '4'])
      expect(listenerLog).toEqual(['2', '4'])

      off()

      count.value = 3

      expect(listenerLog).toEqual(['2', '4'])
      expect(strLog).toEqual(['2', '4'])
      expect(log).toEqual([2, 4])
    })

    it('Should not stop calculation on unsubscribe', () => {
      const doubleLog: number[] = []
      const strListenerLog: string[] = []
      const strLog: string[] = []
      const doubleListenerLog: number[] = []

      const count = new Slot(() => 1)

      const double = new Slot(() => {
        const value = count.value + count.value
        doubleLog.push(value)

        return value
      })

      const str = new Slot(() => {
        const value = String(double.value)
        strLog.push(value)

        return value
      })

      const doubleListener = new Slot(() => {
        doubleListenerLog.push(double.value)
      })

      const strListener = new Slot(() => {
        strListenerLog.push(str.value)
      })

      const offStr = strListener.on()
      const offDouble = doubleListener.on()

      expect(doubleLog).toEqual([2])
      expect(strLog).toEqual(['2'])
      expect(strListenerLog).toEqual(['2'])
      expect(doubleListenerLog).toEqual([2])

      count.value = 2

      expect(doubleLog).toEqual([2, 4])
      expect(strLog).toEqual(['2', '4'])
      expect(strListenerLog).toEqual(['2', '4'])
      expect(doubleListenerLog).toEqual([2, 4])

      offStr()

      count.value = 3

      expect(strLog).toEqual(['2', '4'])
      expect(doubleLog).toEqual([2, 4, 6])
      expect(strListenerLog).toEqual(['2', '4'])
      expect(doubleListenerLog).toEqual([2, 4, 6])

      offDouble()

      count.value = 4

      expect(strLog).toEqual(['2', '4'])
      expect(doubleLog).toEqual([2, 4, 6])
      expect(strListenerLog).toEqual(['2', '4'])
      expect(doubleListenerLog).toEqual([2, 4, 6])
    })

    it('Should correct trigger listeners in a loop dependencies change', () => {
      const log: number[] = []

      const count = new Slot(() => 1)
      const double = new Slot(() => count.value * 2)

      double.on('change', () => {
        log.push(double.raw)

        if (double.raw < 7) {
          count.value++
        }
      })

      double.on()

      expect(log).toEqual([])

      Hub.root.batch(() => {
        count.set(2)
      })

      expect(log).toEqual([4, 6, 8])
    })
  })

  describe('batch', () => {
    it('Should batches states', () => {
      const log: number[] = []
      const count = new Slot(() => 0)

      const listener = new Slot(() => {
        log.push(count.value)
      })

      listener.on()

      expect(log).toEqual([0])

      const action = () => {
        count.value++
        count.value++
      }

      Hub.root.batch(action)

      expect(log).toEqual([0, 2])

      Hub.root.batch(action)

      expect(log).toEqual([0, 2, 4])
    })
  })

  describe('off', () => {
    it('Should unsubscribe on value changes', () => {
      const count = new Slot(() => 0)

      const log: number[] = []

      const listener = new Slot(() => {
        log.push(count.value)
      })

      listener.on()

      expect(log).toEqual([0])

      count.value = 1

      expect(log).toEqual([0, 1])

      listener.off()

      expect(log).toEqual([0, 1])

      count.value = 3

      expect(log).toEqual([0, 1])
    })

    it('Should returns unsubscribe', () => {
      const count = new Slot(() => 0)

      const log: number[] = []

      const listener = new Slot(() => {
        log.push(count.value)
      })

      const off = listener.on()

      expect(log).toEqual([0])

      count.value = 1

      expect(log).toEqual([0, 1])

      count.value = 2

      expect(log).toEqual([0, 1, 2])

      off()

      expect(log).toEqual([0, 1, 2])

      count.value = 3

      expect(log).toEqual([0, 1, 2])
    })
  })

  describe('destroy', () => {
    it('Should remove slot from hub slots map', () => {
      const hub = new Hub()
      const count: Rune<number> = () => 1
      const slot = new Slot(count, hub)

      expect(hub.slots.has(count)).toBe(true)

      slot.destroy()

      expect(hub.slots.has(count)).toBe(false)
    })

    it('Should reset up as inited state after destroy', () => {
      const count = new Slot(() => 1)

      count.on()

      expect(count.up).toBe(true)
      expect(count.inited).toBe(true)

      count.destroy()

      expect(count.up).toBe(false)
      expect(count.inited).toBe(false)
    })

    it('Should unsubscribe from dependencies', () => {
      const log: number[] = []
      const count = new Slot(() => 1)
      const double = new Slot(() => count.value * 2)

      const effect = new Slot(() => log.push(double.value))

      effect.on()
      expect(log).toEqual([2])

      double.destroy()
      expect(log).toEqual([2])

      count.set(2)
      expect(log).toEqual([2])
    })

    it('Should remove slot from subscribers', () => {
      const count = new Slot(() => 1)
      const double = new Slot(() => count.value * 2)

      expect(count.hasSub).toBe(false)

      double.on()

      expect(count.hasSub).toBe(true)

      double.destroy()

      expect(count.hasSub).toBe(false)
    })

    it('Should clean up deps and subs on destroy', () => {
      const count = new Slot(() => 1)
      const double = new Slot(() => count.value * 2)
      const triple = new Slot(() => double.value * 3)

      triple.on()

      expect(count.deps.size).toBe(0)
      expect(double.deps.size).toBe(1)
      expect(triple.deps.size).toBe(1)

      expect(count.subs.size).toBe(1)
      expect(double.subs.size).toBe(1)
      expect(triple.subs.size).toBe(0)

      triple.destroy()

      expect(triple.deps.size).toBe(0)
      expect(triple.subs.size).toBe(0)
      expect(double.deps.size).toBe(0)
      expect(double.subs.size).toBe(0)
      expect(count.deps.size).toBe(0)
      expect(count.subs.size).toBe(0)
    })
  })

  describe('persistent', () => {
    class Persistent {
      storage: Record<string, any> = {}
      listeners = new Set<() => void>()

      subscribe (listener: () => void) {
        this.listeners.add(listener)
      }

      unsubscribe (listener: () => void) {
        this.listeners.delete(listener)
      }

      get (key: string) {
        return this.storage[key]
      }

      set (key: string, value: any) {
        this.storage[key] = value
        this.listeners.forEach((listener) => listener())
      }

      has (key: string) {
        return key in this.storage
      }
    }

    const storage = new Persistent()

    function persistent <T> (key: string, init: T): T {
      const ctx = (Hub.cur ?? Hub.root).ctx
      if (!ctx) return init

      if (!ctx.inited) {
        ctx.on('change', () => {
          storage.set(key, ctx.cur)
        })

        ctx.on('get', () => {
          if (!ctx.up) {
            const cur = storage.get(key)

            if (ctx.prev !== cur) {
              ctx.prev = ctx.cur
              ctx.cur = cur
            }
          }
        })
      }

      if (!ctx.up) {
        const listener = () => {
          ctx.set(storage.get(key))
        }

        storage.subscribe(listener)

        const down = ctx.on('down', () => {
          down()
          storage.unsubscribe(listener)
        })
      }

      if (storage.has(key)) return storage.get(key)

      storage.set(key, init)

      return init
    }

    it('should subscribe to storage change', () => {
      const log: any[] = []
      const count = new Slot(() => persistent('count', 0))

      const effect = new Slot(() => {
        log.push(count.value)
      })

      effect.on()

      expect(log).toEqual([0])
      expect(storage.get('count')).toBe(0)
      expect(storage.listeners.size).toBe(1)

      count.value = 1

      expect(log).toEqual([0, 1])
      expect(storage.get('count')).toBe(1)
      expect(storage.listeners.size).toBe(1)
      storage.set('count', 2)

      expect(count.cur).toBe(2)
      expect(count.value).toBe(2)

      expect(storage.listeners.size).toBe(1)
      expect(log).toEqual([0, 1, 2])
      expect(storage.get('count')).toBe(2)

      effect.off()

      expect(storage.listeners.size).toBe(0)

      count.set(3)
      expect(storage.get('count')).toBe(3)

      storage.set('count', 4)

      expect(count.cur).toBe(3)
      expect(count.raw).toBe(4)
      expect(count.cur).toBe(4)
    })
  })
})
