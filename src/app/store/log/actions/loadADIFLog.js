import { logDB } from '../logDB'
import { parseCallsign } from '@ham2k/lib-callsigns'
import { annotateFromCountryFile } from '@ham2k/lib-country-files'
import { adifToQSON } from '@ham2k/lib-qson-adif'
import { qsoKey } from '@ham2k/lib-qson-tools'

import qsoComparer from '../../../tools/qsoComparer'
import guessCurrentYear from '../../../tools/guessCurrentYear'
import { setCurrentLogInfo } from '../logSlice'
import { setSettingsYear } from '../../settings'

function processOneQSO (qso) {
  qso.our.guess = {}
  qso.their.guess = {}
  if (qso.our.call) {
    parseCallsign(qso.our.call, qso.our.guess)
    annotateFromCountryFile(qso.our.guess, { wae: true })
  }

  parseCallsign(qso.their.call, qso.their.guess)
  if (qso.their.dxccCode) annotateFromCountryFile({ dxccCode: qso.their.dxccCode }, { destination: qso.their, override: false }) // fill any missing dxcc info
  annotateFromCountryFile(qso.their.guess, { wae: true, refs: qso.refs }) // guess dxcc from callsign

  if (
    qso.their.entityPrefix &&
    qso.their.guess.entityPrefix &&
    qso.their.entityPrefix !== qso.their.guess.entityPrefix
  ) {
    if (qso.their.dxccCode === qso.their.guess.dxccCode) {
      // If the entity prefix is wrong, but the DXCC is right, then it's probably a WAE entity
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

export const loadADIFLog = (data, options = {}) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      logDB().then(db => {
        const { settings } = getState()

        const qson = adifToQSON(data)
        let qsos = qson.qsos

        const year = settings?.year ?? guessCurrentYear()
        const yearStart = new Date(`${year}-01-01T00:00:00Z`).valueOf()
        const yearEnd = new Date(`${year}-12-31T23:59:59Z`).valueOf()

        let yearQSOs = qsos.filter(
          qso => qso.startOnMillis <= yearEnd && qso.endOnMillis >= yearStart
        )
        yearQSOs.forEach(qso => {
          qso = processOneQSO(qso)
        })

        if (options.append) {
          const prevQSOs = getState()?.log?.qsos ?? []
          const prevYearQSOs = getState()?.log?.yearQSOs ?? []
          qsos = prevQSOs.concat(qsos)
          yearQSOs = prevYearQSOs.concat(yearQSOs)
        }

        const ourCalls = {}
        const entityGroups = {}

        yearQSOs.forEach(qso => {
          if (qso.our.call) {
            ourCalls[qso.our.call] = (ourCalls[qso.our.call] ?? 0) + 1
          }

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

          if (qso.their.call === 'WE5E') console.log(qso)
          if (qso.their.call === 'VK6AL') console.log(qso)

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

        const transaction = db.transaction(['logs'], 'readwrite')

        const request = transaction
          .objectStore('logs')
          .put({ key: 'current', year, qsos, ourCalls, yearQSOs, entityGroups })

        request.onsuccess = () => {
          dispatch(setCurrentLogInfo({ qsos, ourCalls, yearQSOs, entityGroups }))
          dispatch(setSettingsYear({ year }))
          resolve()
        }
        request.onerror = event => {
          console.error('IndexedDB Error', event, transaction)
          reject(new Error('Error occured'))
        }
      })
    })
  }
}
