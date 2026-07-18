import settingsReducer from './settingsSlice'
import guessCurrentYear from '../../tools/guessCurrentYear'

describe('settings reducer', () => {
  it('should handle initial state', () => {
    expect(settingsReducer(undefined, { type: 'unknown' })).toEqual({
      year: guessCurrentYear(),
      marathonMode: 'regular'
    })
  })
})

