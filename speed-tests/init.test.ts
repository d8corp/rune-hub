import { configure } from 'mobx'
import { perfocode, test } from 'perfocode'

import { initTests } from './initTests'

configure({
  enforceActions: 'never',
})

perfocode('speed-tests/init.test', () => {
  test('max value', () => {})

  initTests()
})
