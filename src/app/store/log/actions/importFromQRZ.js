import { proxyFor } from '../../../tools/proxyFor'
import { selectCurrentYear, selectQrzKey } from '../../settings'
import { loadADIFLog } from './loadADIFLog'

const BASE_URL = 'https://logbook.qrz.com/api'

const HTML_ENTITIES = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&'
}

export const importFromQRZ = (setError) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    const state = getState()
    const key = selectQrzKey(state)
    const year = selectCurrentYear(state)

    const url = new URL(BASE_URL)
    const body = new URLSearchParams()
    body.append('KEY', key)
    body.append('ACTION', 'FETCH')
    body.append('OPTION', `BETWEEN:${year}-01-01 ${year + 1}-01-01`)

    return fetch(proxyFor(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body
    })
      .then((response) => {
        if (response.ok) {
          return response.text()
        } else {
          console.error('Unexpected Error contacting QRZ: bad response')
          console.error(response)
          reject(new Error('Unexpected Error contacting QRZ: bad response'))
        }
      })
      .then((bodyText) => {
        const qrz = parseQrzResponse(bodyText)

        if (qrz.RESULT === 'OK') {
          dispatch(loadADIFLog(qrz.ADIF)).then(
            () => resolve(),
            () => reject(new Error('Error loading ADIF Log'))

          )
        } else {
          console.error('Unexpected QRZ Error', qrz)
          if (qrz.REASON) {
            setError && setError(`Unexpected Error contacting QRZ: ${qrz.REASON}`)
          } else {
            setError && setError('Unexpected Error contacting QRZ')
          }

          reject(new Error('Unexpected QRZ Error'))
        }
      })
      .catch((error) => {
        setError && setError(`Unexpected Error contacting QRZ: ${error.message}`)
        console.log('QRZ Error', error)
        reject(new Error('Unexpected QRZ Error'))
      })
  })
}

/* ================================================================================================================== */
/*
 * QRZ's API uses an "ad-hoc" encoding style.
 * Requests and responses are key/value pairs, supposedly encoded as "URL-encoded Form Data",
 * with `key=value` pairs separated by `&`.
 *
 * But the values are escaped as HTML, not urls (using `&lt;` instead of `%3C`).
 * And notably, the `&` character is not escaped at all.
 *
 * So we cannot use the standard URL manipulation classes and have to roll our own.
 */

const QRZ_PARSING_REGEXP =
  /(RESULT|REASON|LOGIDS|LOGID|COUNT|DATA|ADIF|OPTION|KEY|ACTION|EXTENDED|STATUS)=(.*?)(?=\s*$|&[\s\n\r]*(?:RESULT|REASON|LOGIDS|LOGID|COUNT|DATA|ADIF|OPTION|KEY|ACTION|EXTENDED|STATUS)=)/gs
/*
 * `(RESULT|...)` Match (and capture) any of the QRZ parameter names
 * `=` followed by an equal sign
 * `(.*?)` followed by any number of characters (also captured),
 *              but stop as soon as the rest of the regexp matches (the `?` makes the `*` non-greedy)
 * `(?=\s*($|&\s(?:RESULT|...)=)` followed by zero or more spaces
 *              and then either the end of the string (`$`) or another QRZ parameter name
 *    `(?=)` is a lookahead group that is not included in the resulting match
 *    `(?:)` is a non-capturing group
 *
 * `/g` for global search
 * `/s` to allow `.` to also match line breaks
 */

const HTML_ENTITY_REGEXP = /&\w+;/g

function parseQrzResponse (str) {
  const pairs = {}

  str = str.replace(HTML_ENTITY_REGEXP, (match) => HTML_ENTITIES[match] || `[${match}]`)

  let match
  while ((match = QRZ_PARSING_REGEXP.exec(str))) {
    pairs[match[1]] = match[2]
  }

  return pairs
}
