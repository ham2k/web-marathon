import XLSX from "xlsx"
import { fmtDateTime } from "@ham2k/util/format"

import { CQWWEntities, CQZones } from "../../data/entities"
import Scoresheet from "../../data/Scoresheet-2022.1.xls"

const MODE_TRANSLATION = {
  CW: "CW",
  SSB: "Phone",
  USB: "Phone",
  LSB: "Phone",
  AM: "Phone",
  FM: "Phone",
  default: "Digital",
}

function generateExcel({ entityGroups, entrySelections, entrant }) {
  const workbook = XLSX.read(Scoresheet.data, { type: "array" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]

  const modifyOneRow = (entry, i) => {
    if (entry) {
      XLSX.utils.sheet_add_aoa(
        sheet,
        [
          [
            fmtDateTime(entry.endMillis ?? entry.startMillis, { day: "2-digit", timeZone: "UTC" }),
            fmtDateTime(entry.endMillis ?? entry.startMillis, { month: "2-digit", timeZone: "UTC" }),
            fmtDateTime(entry.endMillis ?? entry.startMillis, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            }).replace(":", ""),
            entry.band.replace("m", ""),
            MODE_TRANSLATION[entry.mode] ?? MODE_TRANSLATION.default,
            entry.their.call,
          ],
        ],
        { origin: `D${17 + i}` }
      )
    }
  }

  XLSX.utils.sheet_add_aoa(sheet, [[entrant.call]], { origin: "B5" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.name]], { origin: "C5" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.street]], { origin: "D5" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.city]], { origin: "B7" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.state]], { origin: "C7" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.country]], { origin: "D7" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.postal]], { origin: "G7" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.cqZone]], { origin: "B9" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.email]], { origin: "C9" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.club]], { origin: "D9" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.notes]], { origin: "B14" })

  XLSX.utils.sheet_add_aoa(sheet, [[entrant.class === "U" ? "X" : ""]], { origin: "G10" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.class === "L" ? "X" : ""]], { origin: "G11" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.class === "F100" ? "X" : ""]], { origin: "G12" })
  XLSX.utils.sheet_add_aoa(sheet, [[entrant.class === "F5" ? "X" : ""]], { origin: "G13" })

  const counts = { entities: 0, zones: 0, rows: 0 }

  CQWWEntities.forEach((entity) => {
    const key = entrySelections[entity.entityPrefix]
    const qsos = entityGroups[entity.entityPrefix] ?? []
    const entry = (key && qsos.find((qso) => qso.key === key)) ?? qsos[0]

    if (entry) {
      counts.entities += 1
    }
    modifyOneRow(entry, counts.rows)
    counts.rows += 1
  })

  CQZones.forEach((zone) => {
    const key = entrySelections[zone.entityPrefix]
    const qsos = entityGroups[zone.entityPrefix] ?? []
    const entry = (key && qsos.find((qso) => qso.key === key)) ?? qsos[0]

    if (entry) {
      counts.zones += 1
    }
    modifyOneRow(entry, counts.rows)
    counts.rows += 1
  })

  XLSX.utils.sheet_add_aoa(sheet, [[counts.entities], [counts.zones], [counts.entities + counts.zones]], {
    origin: "I4",
  })

  XLSX.writeFile(workbook, `${entrant.call} DX Marathon.xls`, { bookType: "biff8" })
}

export default generateExcel
