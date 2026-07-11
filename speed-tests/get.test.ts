import { configure } from 'mobx'
import { perfocode, test } from 'perfocode'

import { getTests } from './getTests'

configure({
  enforceActions: 'never',
})

perfocode('speed-tests/get.test', () => {
  test('max value', () => {})

  getTests()
})
