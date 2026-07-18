let lastYearQSOs = null
let cachedYearQSOsMap = null

export function getSelectedEntry(qsos, entryKey, entrySelections, currentKeyPrefix, yearQSOs) {
  if (entryKey === 'X') {
    return undefined
  }
  if (entryKey) {
    let manualEntry = null
    if (yearQSOs) {
      if (yearQSOs !== lastYearQSOs) {
        lastYearQSOs = yearQSOs
        cachedYearQSOsMap = new Map()
        yearQSOs.forEach(q => {
          if (q && q.key) {
            cachedYearQSOsMap.set(q.key, q)
          }
        })
      }
      manualEntry = cachedYearQSOsMap.get(entryKey)
    }
    if (!manualEntry && qsos) {
      manualEntry = qsos.find(q => q.key === entryKey)
    }
    if (manualEntry) return manualEntry
  }

  return qsos && qsos[0]
}
