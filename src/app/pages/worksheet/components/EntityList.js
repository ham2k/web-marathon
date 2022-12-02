/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react"

import { CQWWEntities, CQZones } from "../../../../data/entities"
import { EntityEntry } from "./EntityEntry"
import { ExcelEntry } from "./ExcelEntry"
import { Typography } from "@mui/material"
import { Box } from "@mui/system"

const styles = {
  root: {
    "& h2": {
      marginTop: "1em",
      borderBottom: "2px solid #333",
    },

    "& .table": {
      width: "inherit important!",
      minWidth: "100%",
      marginTop: "0.5em",
      "& th": {
        textAlign: "left",
        paddingRight: "1em",
      },
      "& td": {
        textAlign: "left",
        paddingRight: "1em",
      },

      "& .col-prefix": {
        textAlign: "center",
        maxWidth: "4em",
        whiteSpace: "nowrap",
      },
      "& .col-name": {
        minWidth: "5.5em",
      },
      "& .col-time": {
        minWidth: "5.5em",
      },
      "& .col-band": {
        textAlign: "right",
      },
      "& .col-call": {
        fontWeight: "bold",
      },
      "& .col-freq": {
        textAlign: "right",
      },
      "& .col-cqz, & .col-ituz, & .col-exch-cqZone, & .col-exch-ituZone": {
        textAlign: "right",
      },
    },
  },
}

export function EntityList({ qsos, entityGroups, entrySelections }) {
  const [selectedPrefix, setSelectedPrefix] = useState("")

  const counts = useMemo(() => {
    const memoCounts = { entities: { qso: 0, qsl: 0, nil: 0 }, zones: { qso: 0, qsl: 0, nil: 0 } }
    CQWWEntities.forEach((entity) => {
      const key = entrySelections[entity.entityPrefix]
      const qsos = entityGroups[entity.entityPrefix] || []
      const entry = (key && qsos.find((qso) => qso.key === key)) || qsos[0]
      if (entry) {
        if (entry.qsl.sources.length > 0) {
          memoCounts.entities.qsl += 1
        } else {
          memoCounts.entities.qso += 1
        }
      } else {
        memoCounts.entities.nil += 1
      }
    })

    CQZones.forEach((zone) => {
      const key = entrySelections[zone.entityPrefix]
      const qsos = entityGroups[zone.entityPrefix] || []
      const entry = qsos.find((qso) => qso.key === key) || qsos[0]
      if (entry) {
        if (entry.qsl.sources.length > 0) {
          memoCounts.zones.qsl += 1
        } else {
          memoCounts.zones.qso += 1
        }
      } else {
        memoCounts.zones.nil += 1
      }
    })
    return memoCounts
  }, [entrySelections, entityGroups])

  return (
    <Box sx={styles.root}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -100,
          height: 1,
          width: 1,
          opacity: 0,
          overflow: "hidden",
        }}
      >
        <table id="excel-table">
          <tbody>
            {CQWWEntities.map((entity, i) => (
              <ExcelEntry
                key={entity.entityPrefix}
                qsos={entityGroups[entity.entityPrefix]}
                entryKey={entrySelections[entity.entityPrefix]}
              />
            ))}
            {CQZones.map((zone, i) => (
              <ExcelEntry
                key={zone.entityPrefix}
                qsos={entityGroups[zone.entityPrefix]}
                entryKey={entrySelections[zone.entityPrefix]}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Typography component="h2" variant="h5" id="entities">
        <b>{counts.entities.qsl + counts.entities.qso} Entities</b>
        {counts.entities.qso > 0 && <span>&nbsp;&nbsp;({counts.entities.qso} unconfirmed)</span>}
      </Typography>

      <table className="table nice-table band-colors">
        <thead>
          <tr>
            <th className="col-prefix">Prefix</th>
            <th className="col-name">Name</th>
            <th className="col-date">Date</th>
            <th className="col-band">Band</th>
            <th className="col-mode">Mode</th>
            <th className="col-call">Call</th>
            <th className="col-qsl">QSL</th>
            <th className="col-other">Other</th>
          </tr>
        </thead>
        <tbody>
          {CQWWEntities.map((entity, i) => (
            <EntityEntry
              key={entity.entityPrefix}
              entity={entity}
              num={i}
              qsos={entityGroups[entity.entityPrefix]}
              entryKey={entrySelections[entity.entityPrefix]}
              selectedPrefix={selectedPrefix}
              setSelectedPrefix={setSelectedPrefix}
            />
          ))}
        </tbody>
      </table>

      <Typography component="h2" variant="h5" id="zones">
        <b>{counts.zones.qsl + counts.zones.qso} Zones</b>
        {counts.zones.qso > 0 && <span>&nbsp;&nbsp;({counts.zones.qso} unconfirmed)</span>}
      </Typography>
      <table className="table nice-table band-colors">
        <thead>
          <tr>
            <th className="col-prefix">Prefix</th>
            <th className="col-name">Name</th>
            <th className="col-date">Date</th>
            <th className="col-band">Band</th>
            <th className="col-mode">Mode</th>
            <th className="col-call">Call</th>
            <th className="col-qsl">QSL</th>
            <th className="col-other">Other</th>
          </tr>
        </thead>
        <tbody>
          {CQZones.map((zone, i) => (
            <EntityEntry
              key={zone.entityPrefix}
              entity={zone}
              num={i}
              qsos={entityGroups[zone.entityPrefix]}
              entryKey={entrySelections[zone.entityPrefix]}
              selectedPrefix={selectedPrefix}
              setSelectedPrefix={setSelectedPrefix}
            />
          ))}
        </tbody>
      </table>
    </Box>
  )
}
