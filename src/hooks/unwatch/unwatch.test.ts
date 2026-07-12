import { get, on, set, unwatch } from '../..'

describe('unwatch', () => {
  it('Should return value from unwatched action', () => {
    const count = () => 42

    const result = unwatch(() => get(count))

    expect(result).toBe(42)
  })

  it('Should execute action without tracking dependencies', () => {
    const log: number[] = []
    const count = () => 0

    const doubled = () => {
      const value = unwatch(() => get(count))

      return value * 2
    }

    const effect = () => {
      log.push(get(doubled))
    }

    on(effect)
    expect(log).toEqual([0])

    set(count, 5)
    expect(log).toEqual([0])

    set(count, 10)
    expect(log).toEqual([0])
  })

  it('Should work within computed rune', () => {
    const log: number[] = []
    const a = () => 1
    const b = () => 2

    const computed = () => {
      const valA = get(a)
      const valB = unwatch(() => get(b))

      return valA + valB
    }

    const effect = () => {
      log.push(get(computed))
    }

    on(effect)
    expect(log).toEqual([3])

    set(a, 10)
    expect(log).toEqual([3, 12])

    set(b, 20)
    expect(log).toEqual([3, 12])
  })
})
