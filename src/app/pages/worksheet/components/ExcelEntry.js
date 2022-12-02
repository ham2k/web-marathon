import { fmtDateTime } from "@ham2k/util/format"
import React from "react"

const MODE_TRANSLATION = {
  CW: "CW",
  SSB: "Phone",
  USB: "Phone",
  LSB: "Phone",
  AM: "Phone",
  FM: "Phone",
  default: "Digital",
}
export function ExcelEntry({ qsos, entryKey }) {
  let entry

  if (entryKey) {
    entry = qsos && qsos.find((q) => q.key === entryKey)
  } else {
    entry = qsos && qsos[0]
  }

  if (entry) {
    return (
      <tr>
        <td>{fmtDateTime(entry.endMillis ?? entry.startMillis, { day: "2-digit", timeZone: "UTC" })}</td>
        <td>{fmtDateTime(entry.endMillis ?? entry.startMillis, { month: "2-digit", timeZone: "UTC" })}</td>
        <td>
          {fmtDateTime(entry.endMillis ?? entry.startMillis, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "UTC",
          }).replace(":", "")}
        </td>
        <td>{entry.band.replace("m", "")}</td>
        <td>{MODE_TRANSLATION[entry.mode] ?? MODE_TRANSLATION.default}</td>
        <td>{entry.their.call}</td>
      </tr>
    )
  } else {
    return (
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    )
  }
}
