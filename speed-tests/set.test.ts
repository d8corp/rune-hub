import { configure } from 'mobx'
import { perfocode, test } from 'perfocode'

import { setTests } from './setTests'

configure({
  enforceActions: 'never',
})

perfocode('speed-tests/set.test', () => {
  test('max value', () => {})

  setTests()
})
