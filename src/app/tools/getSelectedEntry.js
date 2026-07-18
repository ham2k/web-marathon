export function getSelectedEntry(qsos, entryKey, entrySelections, currentKeyPrefix, yearQSOs) {
  if (entryKey === 'X') {
    return undefined
  }
  if (entryKey) {
    const manualEntry = (yearQSOs && yearQSOs.find(q => q.key === entryKey)) || (qsos && qsos.find(q => q.key === entryKey))
    if (manualEntry) return manualEntry
  }

  if (qsos && qsos.length > 0) {
    const otherSelections = new Set()
    if (entrySelections) {
      Object.keys(entrySelections).forEach(key => {
        if (key !== currentKeyPrefix) {
          const val = entrySelections[key]
          if (val && val !== 'X') {
            otherSelections.add(val)
          }
        }
      })
    }

    const available = qsos.find(q => !otherSelections.has(q.key))
    return available || qsos[0]
  }

  return undefined
}
