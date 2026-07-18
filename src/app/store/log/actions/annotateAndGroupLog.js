import { parseCallsign } from '@ham2k/lib-callsigns'
import { annotateFromCountryFile } from '@ham2k/lib-country-files'
import { qsoKey } from '@ham2k/lib-qson-tools'
import qsoComparer from '../../../tools/qsoComparer'

const VALID_BANDS = {
  '160m': true,
  '80m': true,
  '60m': true,
  '40m': true,
  '30m': true,
  '20m': true,
  '17m': true,
  '15m': true,
  '12m': true,
  '10m': true,
  '6m': true,
}

function processOneQSO(qso) {
  qso.notes = []
  qso.our = qso.our ?? {}
  qso.their = qso.their ?? {}
  qso.our.guess = {}
  qso.their.guess = {}
  if (qso.our.call) {
    parseCallsign(qso.our.call, qso.our.guess)
    annotateFromCountryFile(qso.our.guess, { wae: true })
  }

  parseCallsign(qso.their.call, qso.their.guess)
  if (qso.their.dxccCode) annotateFromCountryFile({ dxccCode: qso.their.dxccCode }, { destination: qso.their, override: false })

  annotateFromCountryFile(qso.their.guess, { wae: true, refs: qso.refs })

  if (
    qso.their.entityPrefix &&
    qso.their.guess.entityPrefix &&
    qso.their.entityPrefix !== qso.their.guess.entityPrefix
  ) {
    if (qso.their.dxccCode === qso.their.guess.dxccCode) {
      qso.notes = qso.notes ?? []
      const note = {
        about: 'waeEntity',
        note: `Log says ${qso.their.entityName}.\nWe believe it should be ${qso.their.guess.entityName}.`
      }
      qso.notes.push(note)
    } else {
      qso.notes = qso.notes ?? []
      const note = {
        about: 'entityPrefix',
        note: `Log says ${qso.their.entityName}.\nWe believe it should be ${qso.their.guess.entityName}.`
      }
      qso.notes.push(note)
    }
  }

  if (
    qso.their.cqZone &&
    qso.their.guess.cqZone &&
    qso.their.cqZone !== qso.their.guess.cqZone
  ) {
    qso.notes = qso.notes ?? []
    const note = {
      about: 'cqZone',
      note: `Log says Zone ${qso.their.cqZone}.\nWe believe it should be Zone ${qso.their.guess.cqZone}.`
    }
    qso.notes.push(note)
  }

  qso.key = qsoKey(qso)

  return qso
}

function matchCallsign(callsign, pattern) {
  if (!pattern) return false
  if (pattern.startsWith('**')) {
    return callsign.endsWith(pattern.slice(2))
  }
  if (pattern.endsWith('*')) {
    return callsign.startsWith(pattern.slice(0, -1))
  }
  return callsign === pattern
}

function matchBand(qsoBand, patternBand) {
  if (!patternBand) return true
  const cleanQsoBand = qsoBand.replace('m', '')
  if (patternBand === 'VHF') {
    return cleanQsoBand === '6'
  }
  const bands = patternBand.split('/')
  return bands.includes(cleanQsoBand)
}

function simplifyModeForMatching(m) {
  if (!m) return ''
  m = m.toUpperCase()
  if (m === 'SSB' || m === 'PHONE' || m === 'USB' || m === 'LSB' || m === 'AM' || m === 'FM') return 'PHONE'
  return m
}

function matchMode(qsoMode, patternMode) {
  if (!patternMode) return true
  return simplifyModeForMatching(qsoMode) === simplifyModeForMatching(patternMode)
}

function parsePatternDate(dateStr) {
  if (!dateStr) return null
  let parts = dateStr.split('-')
  if (parts.length === 3) {
    return new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])))
  }
  parts = dateStr.split('/')
  if (parts.length === 3) {
    return new Date(Date.UTC(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1])))
  }
  return null
}

function matchDates(qsoTime, startOnStr, endOnStr) {
  const startDate = parsePatternDate(startOnStr)
  if (startDate && qsoTime < startDate.valueOf()) {
    return false
  }
  const endDate = parsePatternDate(endOnStr)
  if (endDate) {
    const endTimestamp = endDate.valueOf() + 24 * 60 * 60 * 1000 - 1
    if (qsoTime > endTimestamp) {
      return false
    }
  }
  return true
}

function matchEntity(qso, patternEntity) {
  if (!patternEntity) return true
  return qso.their.entityPrefix === patternEntity || qso.their.guess?.entityPrefix === patternEntity
}

function matchZone(qso, patternZone) {
  if (!patternZone) return true
  const zoneNum = parseInt(patternZone)
  return qso.their.cqZone === zoneNum || qso.their.guess?.cqZone === zoneNum
}

function matchQSOToPattern(qso, pattern) {
  if (!matchCallsign(qso.their.call, pattern.callsign)) return false
  if (!matchBand(qso.band, pattern.band)) return false
  if (!matchMode(qso.mode, pattern.mode)) return false
  const qsoTime = qso.endOnMillis || qso.startAtMillis || qso.endAtMillis || qso.startAtMillis
  if (!matchDates(qsoTime, pattern.startOn, pattern.endOn)) return false
  if (!matchEntity(qso, pattern.entity)) return false
  if (!matchZone(qso, pattern.zone)) return false
  return true
}

export function annotateAndGroupLog(qsos, goodCalls = [], badCalls = [], year) {
  const yearStart = new Date(`${year}-01-01T00:00:00Z`).valueOf()
  const yearEnd = new Date(`${year}-12-31T23:59:59Z`).valueOf()

  let yearQSOs = qsos.filter(qso => {
    if (!VALID_BANDS[qso.band]) return false
    return (qso.startAtMillis || qso.endOnMillis) <= yearEnd && (qso.endAtMillis || qso.endOnMillis || qso.startAtMillis) >= yearStart
  }).map(qso => ({
    ...qso,
    our: { ...qso.our },
    their: { ...qso.their },
    qsl: qso.qsl ? { ...qso.qsl } : undefined,
    notes: qso.notes ? [...qso.notes] : []
  }))

  const uniqueYearQSOs = []
  const seenQSOs = new Map()

  yearQSOs.forEach(qso => {
    qso = processOneQSO(qso)

    // Reset list matching annotations and notes
    qso.isGoodCall = false
    qso.isBadCall = false
    qso.badCallCategory = undefined
    if (qso.notes) {
      qso.notes = qso.notes.filter(n => n.about !== 'goodCall' && n.about !== 'badCall')
    }

    // Match against bad calls first
    for (const pattern of badCalls) {
      if (matchQSOToPattern(qso, pattern)) {
        qso.isBadCall = true
        qso.badCallCategory = pattern.category // 'I' or 'B'
        qso.notes = qso.notes ?? []
        qso.notes.push({
          about: 'badCall',
          note: pattern.notes || `Invalid operation / bad spot for ${pattern.callsign}.`
        })
        break // Match one is enough to mark bad
      }
    }

    // Match against good calls
    for (const pattern of goodCalls) {
      if (matchQSOToPattern(qso, pattern)) {
        qso.isGoodCall = true
        qso.notes = qso.notes ?? []
        qso.notes.push({
          about: 'goodCall',
          note: pattern.notes || `Known active operation for ${pattern.callsign}.`
        })
        break
      }
    }

    if (qso.notes) {
      const seen = new Set()
      qso.notes = qso.notes.filter(note => {
        const key = `${note.about}:${note.note}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    const existing = seenQSOs.get(qso.key)
    if (existing) {
      existing.notes = existing.notes ?? []
      if (!existing.notes.some(n => n.about === 'duplicateQSO')) {
        existing.notes.push({
          about: 'duplicateQSO',
          note: 'This QSO was duplicated in the imported log. Redundant records were ignored.'
        })
      }
    } else {
      seenQSOs.set(qso.key, qso)
      uniqueYearQSOs.push(qso)
    }
  })

  yearQSOs = uniqueYearQSOs

  const entityGroups = {}

  yearQSOs.forEach(qso => {
    if (qso.their.entityPrefix) {
      entityGroups[qso.their.entityPrefix] =
        entityGroups[qso.their.entityPrefix] ?? []
      entityGroups[qso.their.entityPrefix].push(qso)
    }
    if (
      qso.their.guess.entityPrefix &&
      qso.their.guess.entityPrefix !== qso.their.entityPrefix
    ) {
      entityGroups[qso.their.guess.entityPrefix] =
        entityGroups[qso.their.guess.entityPrefix] ?? []
      entityGroups[qso.their.guess.entityPrefix].push(qso)
    }

    if (qso.their.cqZone) {
      entityGroups[`Zone ${qso.their.cqZone}`] =
        entityGroups[`Zone ${qso.their.cqZone}`] ?? []
      entityGroups[`Zone ${qso.their.cqZone}`].push(qso)
    }
    if (
      qso.their.guess.cqZone &&
      qso.their.guess.cqZone !== qso.their.cqZone
    ) {
      entityGroups[`Zone ${qso.their.guess.cqZone}`] =
        entityGroups[`Zone ${qso.their.guess.cqZone}`] ?? []
      entityGroups[`Zone ${qso.their.guess.cqZone}`].push(qso)
    }
  })

  Object.keys(entityGroups).forEach(key => {
    entityGroups[key] = entityGroups[key].sort(qsoComparer)
  })

  return { yearQSOs, entityGroups }
}
