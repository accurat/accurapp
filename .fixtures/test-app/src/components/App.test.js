
import { firstDayOfYear } from './App'

describe(firstDayOfYear, () => {
  it('should return Jan 1st of the year (UTC)', () => {
    expect(firstDayOfYear(2019).toISOString()).toBe('2019-01-01T00:00:00.000Z')
  })
})