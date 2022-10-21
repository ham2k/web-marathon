/* eslint-disable no-unused-vars */
import React, { useState } from "react"

import { makeStyles } from "@mui/styles"
import classNames from "classnames"

import commonStyles from "../../../styles/common"

import { ENTITIES } from "@ham2k/data/cqww"
import { selectEntityGroups } from "../../../store/log"
import { useSelector } from "react-redux"
import { selectEntityEntries } from "../../../store/entries"
import { EntityEntry } from "./EntityEntry"

const CQWWEntities = Object.values(ENTITIES).sort((a, b) => {
  const attr = "entityPrefix"
  const aValue = a[attr][0] === "*" ? a[attr].slice(1) : a[attr]
  const bValue = b[attr][0] === "*" ? b[attr].slice(1) : b[attr]
  return aValue.localeCompare(bValue)
})

const useStyles = makeStyles((theme) => ({
  ...commonStyles(theme),

  root: {
    "& h2": {
      marginTop: "1em",
      borderBottom: "2px solid #333",
    },
  },

  table: {
    width: "inherit important!",
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
      maxWidth: "3em",
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
}))

export function EntityList({ qson }) {
  const [selectedPrefix, setSelectedPrefix] = useState("")
  const classes = useStyles()
  const entityGroups = useSelector(selectEntityGroups)
  const entityEntries = useSelector(selectEntityEntries)

  return (
    <table className={classNames(classes.niceTable, classes.table, classes.bandColors)}>
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
            entryKey={entityEntries[entity.entityPrefix]}
            selectedPrefix={selectedPrefix}
            setSelectedPrefix={setSelectedPrefix}
          />
        ))}
      </tbody>
    </table>
  )
}
