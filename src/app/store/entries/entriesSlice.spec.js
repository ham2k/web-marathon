import entriesReducer, { setSelection, resetSelections, setCurrentLogCalls } from './entriesSlice'

describe('entries reducer', () => {
  it('should handle initial state', () => {
    expect(entriesReducer(undefined, { type: 'unknown' })).toEqual({
      selections: {},
      calls: undefined
    })
  })

  it('should handle setSelection', () => {
    const state = entriesReducer(undefined, setSelection({ prefix: 'K-80m', key: 'qso-1' }))
    expect(state.selections).toEqual({
      'K-80m': 'qso-1'
    })
  })

  it('should handle resetSelections', () => {
    const initialState = {
      selections: { 'K-80m': 'qso-1' },
      calls: ['K1D']
    }
    expect(entriesReducer(initialState, resetSelections())).toEqual({
      selections: {},
      calls: undefined
    })
  })
})
