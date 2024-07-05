import { describe, expect, it } from '@jest/globals'

import retryMethod from '../src/utils/retryMethod.js'
import randomName from '../src/utils/randomName.js'

describe('Utils related', () => {
  it('retryMethod', async () => {
    let retry1 = 0
    const retryMethod1 = retryMethod(() => {
      if (retry1 < 3) {
        retry1++
        throw new Error('test')
      }
    })
    await retryMethod1()
    expect(retry1).toBe(3)

    const startTime = Date.now()
    let retry2 = 0
    const retryMethod2 = retryMethod(
      () => {
        if (retry2 < 10) {
          retry2++
          throw new Error('test')
        }
      },
      {
        max: 5,
        interval: 200
      }
    )
    try {
      await retryMethod2()
      expect(false).toBe(true) // should not reach here
    } catch (e) {
      expect(retry2).toBe(6)
    }
    expect(Math.abs(Date.now() - startTime - 1000)).toBeLessThan(100)
  })

  it('randomName', () => {
    const name1 = randomName('test-')
    expect(name1).toMatch(/^test-[a-z0-9]{3}/)

    const name2 = randomName()
    expect(name2).toMatch(/^sumor-docker-[a-z0-9]{3}/)
  })
})
