import { fmtDateTime } from '@ham2k/lib-format-tools'
import React from 'react'

const MODE_TRANSLATION = {
  CW: 'CW',
  SSB: 'Phone',
  USB: 'Phone',
  LSB: 'Phone',
  AM: 'Phone',
  FM: 'Phone',
  default: 'Digital'
}
export function ExcelEntry ({ qsos, entryKey }) {
  let entry

  if (entryKey) {
    entry = (qsos && qsos.find((q) => q.key === entryKey)) || (qsos && qsos[0])
  } else {
    entry = qsos && qsos[0]
  }

  if (entry) {
    return (
      <tr>
        <td>{fmtDateTime(entry.endOnMillis ?? entry.startOnMillis, { day: '2-digit', timeZone: 'UTC' })}</td>
        <td>{fmtDateTime(entry.endOnMillis ?? entry.startOnMillis, { month: '2-digit', timeZone: 'UTC' })}</td>
        <td>
          {fmtDateTime(entry.endOnMillis ?? entry.startOnMillis, {
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
            timeZone: 'UTC'
          }).replace(':', '')}
        </td>
        <td>{entry.band.replace('m', '')}</td>
        <td>{MODE_TRANSLATION[entry.mode] ?? MODE_TRANSLATION.default}</td>
        <td>{entry.their.call}</td>
      </tr>
    )
  } else {
    return (
      <tr>
        <td />
        <td />
        <td />
        <td />
        <td />
        <td />
      </tr>
    )
  }
}
