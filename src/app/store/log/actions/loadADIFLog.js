import { logDB } from "../logDB"
import { parseCallsign } from "@ham2k/lib-callsigns"
import { annotateFromCountryFile, fillDXCCfromCountryFile } from "@ham2k/lib-country-files"
import { adifToQSON } from "@ham2k/lib-qson-adif"
import { qsoKey } from "@ham2k/lib-qson-tools"

import qsoComparer from "../../../tools/qsoComparer"
import qslSourceComparer from "../../../tools/qslSourceComparer"
import guessCurrentYear from "../../../tools/guessCurrentYear"
import { setCurrentLogInfo } from "../logSlice"
import { setSettingsYear } from "../../settings"

function processOneQSO(qso) {
  qso.our.guess = {}
  qso.their.guess = {}
  if (qso.our.call) {
    parseCallsign(qso.our.call, qso.our.guess)
    annotateFromCountryFile(qso.our.guess, { wae: true, state: qso.our.state })
  }

  parseCallsign(qso.their.call, qso.their.guess)
  const iotaRef = qso.refs && qso.refs.find((ref) => ref.type === "iota")
  if (qso.their.dxccCode) fillDXCCfromCountryFile(qso.their.dxccCode, qso.their) // fill any missing dxcc info
  annotateFromCountryFile(qso.their.guess, { wae: true, state: qso.their.state, iota: iotaRef?.ref }) // guess dxcc from callsign

  if (
    qso.their.entityPrefix &&
    qso.their.guess.entityPrefix &&
    qso.their.entityPrefix !== qso.their.guess.entityPrefix
  ) {
    qso.notes = qso.notes ?? []
    const note = {
      about: "entityPrefix",
      note: `Log says ${qso.their.entityName}.\nWe believe it should be ${qso.their.guess.entityName}.`,
    }
    qso.notes.push(note)
  }

  if (qso.their.cqZone && qso.their.guess.cqZone && qso.their.cqZone !== qso.their.guess.cqZone) {
    qso.notes = qso.notes ?? []
    const note = {
      about: "cqZone",
      note: `Log says Zone ${qso.their.cqZone}.\nWe believe it should be Zone ${qso.their.guess.cqZone}.`,
    }
    qso.notes.push(note)
  }

  qso.key = qsoKey(qso)

  // Sort QSL info by trust level
  qso.qsl = qso.qsl ?? {}
  qso.qsl.sources = (qso.qsl.sources ?? []).sort(qslSourceComparer)

  return qso
}

export const loadADIFLog =
  (data, options = {}) =>
  (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      logDB().then((db) => {
        const { settings } = getState()

        const qson = adifToQSON(data)
        let qsos = qson.qsos

        const year = settings?.year ?? guessCurrentYear()
        const yearStart = new Date(`${year}-01-01T00:00:00Z`).valueOf()
        const yearEnd = new Date(`${year}-12-31T23:59:59Z`).valueOf()

        let yearQSOs = qsos.filter((qso) => qso.startMillis <= yearEnd && qso.endMillis >= yearStart)
        yearQSOs.forEach((qso) => {
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

        yearQSOs.forEach((qso) => {
          if (qso.our.call) {
            ourCalls[qso.our.call] = (ourCalls[qso.our.call] ?? 0) + 1
          }

          if (qso.their.entityPrefix) {
            entityGroups[qso.their.entityPrefix] = entityGroups[qso.their.entityPrefix] ?? []
            entityGroups[qso.their.entityPrefix].push(qso)
          }
          if (qso.their.guess.entityPrefix && qso.their.guess.entityPrefix !== qso.their.entityPrefix) {
            entityGroups[qso.their.guess.entityPrefix] = entityGroups[qso.their.guess.entityPrefix] ?? []
            entityGroups[qso.their.guess.entityPrefix].push(qso)
          }

          if (qso.their.cqZone) {
            entityGroups[`Zone ${qso.their.cqZone}`] = entityGroups[`Zone ${qso.their.cqZone}`] ?? []
            entityGroups[`Zone ${qso.their.cqZone}`].push(qso)
          }
          if (qso.their.guess.cqZone && qso.their.guess.cqZone !== qso.their.cqZone) {
            entityGroups[`Zone ${qso.their.guess.cqZone}`] = entityGroups[`Zone ${qso.their.guess.cqZone}`] ?? []
            entityGroups[`Zone ${qso.their.guess.cqZone}`].push(qso)
          }
        })

        Object.keys(entityGroups).forEach((key) => {
          entityGroups[key] = entityGroups[key].sort(qsoComparer)
        })

        const transaction = db.transaction(["logs"], "readwrite")
        const request = transaction
          .objectStore("logs")
          .put({ key: "current", year, qsos, ourCalls, yearQSOs, entityGroups })
        request.onsuccess = () => {
          dispatch(setCurrentLogInfo({ qsos, ourCalls, yearQSOs, entityGroups }))
          dispatch(setSettingsYear({ year }))
          resolve()
        }
        request.onerror = (event) => {
          console.error("IndexedDB Error", event, transaction)
          reject("Error occured")
        }
      })
    })
  }
