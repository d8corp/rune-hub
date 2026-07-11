import { configure } from 'mobx'
import { perfocode, test } from 'perfocode'

import { batchingTests } from './speed-tests/batchingTests'
import { examplesTests } from './speed-tests/examplesTests'
import { getTests } from './speed-tests/getTests'
import { initTests } from './speed-tests/initTests'
import { setTests } from './speed-tests/setTests'

configure({
  enforceActions: 'never',
})

perfocode('temp.test', () => {
  test('max value', () => {})

  initTests()
  getTests()
  setTests()
  batchingTests()
  examplesTests()
})
