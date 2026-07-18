import { getSelectedEntry } from './getSelectedEntry'

describe('getSelectedEntry', () => {
  const qsos = [
    { key: 'qso-1', band: '20m', their: { call: '3Y0K' } },
    { key: 'qso-2', band: '20m', their: { call: '3X3A' } }
  ]
  const yearQSOs = [
    ...qsos,
    { key: 'qso-3', band: '15m', their: { call: '3Y0K' } }
  ]

  it('should return undefined if entryKey is X', () => {
    expect(getSelectedEntry(qsos, 'X', {}, 'prefix', yearQSOs)).toBeUndefined()
  })

  it('should return manually selected QSO by key if present in yearQSOs', () => {
    expect(getSelectedEntry(qsos, 'qso-3', {}, 'prefix', yearQSOs)).toEqual(yearQSOs[2])
  })

  it('should return first candidate if no manual selection and no conflicts', () => {
    expect(getSelectedEntry(qsos, undefined, {}, 'prefix', yearQSOs)).toEqual(qsos[0])
  })

  it('should skip other entities manual selections when defaulting', () => {
    const entrySelections = {
      'other-prefix': 'qso-1'
    }
    expect(getSelectedEntry(qsos, undefined, entrySelections, 'prefix', yearQSOs)).toEqual(qsos[1])
  })
})
