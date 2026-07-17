import logReducer from './logSlice'

describe('log reducer', () => {
  it('should handle initial state', () => {
    expect(logReducer(undefined, { type: 'unknown' })).toEqual({})
  })
})
