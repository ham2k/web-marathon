import { logDB } from '../logDB'
import { adifToQSON } from '@ham2k/lib-qson-adif'
import guessCurrentYear from '../../../tools/guessCurrentYear'
import { setCurrentLogInfo } from '../logSlice'
import { setSettingsYear } from '../../settings'
import { annotateAndGroupLog } from './annotateAndGroupLog'

export const loadADIFLog = (data, options = {}) => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      logDB().then(db => {
        const { settings, log: logState } = getState()

        const qson = adifToQSON(data)
        let qsos = qson.qsos

        const year = settings?.year ?? guessCurrentYear()

        if (options.append) {
          const prevQSOs = logState?.qsos ?? []
          qsos = prevQSOs.concat(qsos)
        }

        const goodCalls = logState?.goodCalls ?? []
        const badCalls = logState?.badCalls ?? []

        const { yearQSOs, entityGroups } = annotateAndGroupLog(qsos, goodCalls, badCalls, year)

        const ourCalls = {}
        yearQSOs.forEach(qso => {
          if (qso.our.call) {
            ourCalls[qso.our.call] = (ourCalls[qso.our.call] ?? 0) + 1
          }
        })

        const transaction = db.transaction(['logs'], 'readwrite')

        const request = transaction
          .objectStore('logs')
          .put({ key: 'current', year, qsos, ourCalls, yearQSOs, entityGroups })

        request.onsuccess = () => {
          dispatch(setCurrentLogInfo({ qsos, ourCalls, yearQSOs, entityGroups, year }))
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
