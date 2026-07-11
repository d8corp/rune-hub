import { configure } from 'mobx'
import { perfocode, test } from 'perfocode'

import { batchingTests } from './batchingTests'

configure({
  enforceActions: 'never',
})

perfocode('speed-tests/batching.test', () => {
  test('max value', () => {})

  batchingTests()
})
