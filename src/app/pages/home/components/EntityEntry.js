import React from "react"

import { makeStyles } from "@mui/styles"
import classNames from "classnames"

import commonStyles from "../../../styles/common"
import { fmtInteger } from "@ham2k/util/format"
import { fmtDateTime } from "@ham2k/util/format"
import { Button, Chip } from "@mui/material"
import { CheckCircleRounded, Error, PushPin, PushPinOutlined } from "@mui/icons-material"
import { useDispatch } from "react-redux"
import { setEntryForEntity } from "../../../store/entries"

const useStyles = makeStyles((theme) => ({
  ...commonStyles(theme),
  root: {},
  odd: {
    "& td": {
      backgroundColor: "#F0F0F0",
    },
  },
  even: {
    "& td": {
      backgroundColor: "#FFF",
    },
  },
}))

const DATE_FORMAT = {
  hourCycle: "h23",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "numeric",
  timeZone: "Zulu",
}

export function EntityEntry({ entity, num, qsos, entryKey, selectedPrefix, setSelectedPrefix }) {
  const classes = useStyles()
  const dispatch = useDispatch()

  const prefix = entity.entityPrefix

  let entry

  const handleToggleEntityEntry = (event) => {
    if (selectedPrefix === prefix) setSelectedPrefix("")
    else setSelectedPrefix(prefix)
  }

  const handleSelectEntry = (newEntry) => {
    dispatch(setEntryForEntity({ prefix: entity.entityPrefix, key: newEntry.key }))
    setSelectedPrefix("")
  }

  if (entryKey) {
    entry = qsos && qsos.find((q) => q.key === entryKey)
  } else {
    entry = qsos && qsos[0]
  }

  return (
    <>
      <tr
        className={classNames(
          classes.root,
          prefix && selectedPrefix === prefix && "selected",
          num % 2 === 0 ? classes.even : classes.odd
        )}
      >
        <td className="col-prefix">{prefix}</td>
        <td className="col-name">
          {entity.flag || "🏳"}&nbsp;
          {entity.name}
        </td>
        {entry ? (
          <>
            <td className="col-date">{fmtDateTime(entry.endMillis, DATE_FORMAT)}</td>
            <td className={classNames("col-band", "band-color")}>{entry.band}</td>
            <td className="col-mode">{entry.mode}</td>
            <td className="col-call">{entry.their.call}</td>
            <td className="col-qsl">
              {bestQSLSource(entry) ? (
                <Chip label={bestQSLSource(entry)} color="info" size="small" icon={<CheckCircleRounded />} />
              ) : (
                <Chip label={"???"} color="warning" size="small" icon={<Error />} />
              )}
            </td>
            <td className="col-other">
              {entryKey && entry ? (
                <Button color="info" size="small" onClick={handleToggleEntityEntry}>
                  <PushPin fontSize="small" />
                  {qsos.length > 1 ? `+${fmtInteger(qsos.length - 1)}` : ""}
                </Button>
              ) : qsos?.length > 0 ? (
                <Button color="info" size="small" onClick={handleToggleEntityEntry}>
                  <PushPinOutlined fontSize="small" />
                  {fmtInteger(qsos.length)}
                </Button>
              ) : (
                "-"
              )}
            </td>
          </>
        ) : (
          <td colSpan="6"> - </td>
        )}
      </tr>
      {prefix &&
        selectedPrefix === prefix &&
        qsos
          .filter((qso) => qso.key !== entry.key)
          .map((qso) => (
            <tr
              key={qso.key}
              className={classNames(
                classes.root,
                prefix && selectedPrefix === prefix && "selected",
                num % 2 === 0 ? classes.even : classes.odd
              )}
            >
              <td colSpan="2">&nbsp;</td>
              <td className="col-date">{fmtDateTime(qso.endMillis, DATE_FORMAT)}</td>
              <td className={classNames("col-band", "band-color")}>{qso.band}</td>
              <td className="col-mode">{qso.mode}</td>
              <td className="col-call">{qso.their.call}</td>
              <td className="col-qsl">
                {bestQSLSource(qso) ? (
                  <Chip label={bestQSLSource(qso)} color="info" size="small" icon={<CheckCircleRounded />} />
                ) : (
                  <Chip label={"???"} color="warning" size="small" icon={<Error />} />
                )}
              </td>
              <td>
                <Button color="info" size="small" onClick={() => handleSelectEntry(qso)}>
                  <PushPinOutlined fontSize="small" />
                </Button>
              </td>
            </tr>
          ))}
    </>
  )
}

function bestQSLSource(entry) {
  const sources = (entry.qsl?.sources || []).map((s) => s.via)

  if (sources.indexOf("lotw") >= 0) return "lotw"
  else if (sources.indexOf("qrz") >= 0) return "qrz"
  else return sources[0]
}
