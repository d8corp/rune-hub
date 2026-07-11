import { configure } from 'mobx'
import { perfocode, test } from 'perfocode'

import { examplesTests } from './examplesTests'

configure({
  enforceActions: 'never',
})

perfocode('speed-tests/examples.test', () => {
  test('max value', () => {})

  examplesTests()
})
