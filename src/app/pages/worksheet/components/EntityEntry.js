import React from "react"

import classNames from "classnames"

import { fmtInteger } from "@ham2k/util/format"
import { fmtDateTime } from "@ham2k/util/format"
import { Button, Chip, Tooltip } from "@mui/material"
import {
  CheckCircleRounded,
  Error,
  HearingDisabled,
  Key,
  Language,
  LocalPostOffice,
  MoveToInbox,
  PushPin,
  PushPinOutlined,
} from "@mui/icons-material"
import { useDispatch } from "react-redux"
import { setSelection } from "../../../store/entries"
import { Box } from "@mui/system"

const styles = {
  root: {
    "&.odd td": {
      backgroundColor: "#F0F0F0",
    },
    "&.even td": {
      backgroundColor: "#FFF",
    },
  },
}

const DATE_FORMAT = {
  hourCycle: "h23",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "numeric",
  timeZone: "UTC",
}

const QSL_ICONS = {
  lotw: Key,
  qrz: Language,
  eqsl: MoveToInbox,
  card: LocalPostOffice,
  default: CheckCircleRounded,
}

export function EntityEntry({ entity, num, qsos, entryKey, selectedPrefix, setSelectedPrefix }) {
  const dispatch = useDispatch()

  const prefix = entity.entityPrefix

  let entry

  const handleToggleEntityEntry = (event) => {
    if (selectedPrefix === prefix) setSelectedPrefix("")
    else setSelectedPrefix(prefix)
  }

  const handleSelectEntry = (newEntry) => {
    dispatch(setSelection({ prefix: entity.entityPrefix, key: newEntry.key }))
    setSelectedPrefix("")
  }

  if (entryKey) {
    entry = qsos && qsos.find((q) => q.key === entryKey)
  } else {
    entry = qsos && qsos[0]
  }

  const cols = []
  cols.push(
    <td key="prefix" className="col-prefix callsign">
      {prefix}
    </td>
  )
  cols.push(
    <td key="name" className="col-name">
      {entity.flag ?? "🏳"}&nbsp;
      {entity.name}
    </td>
  )
  if (entry) {
    cols.push(
      <td key="date" className="col-date">
        {fmtDateTime(entry.endMillis, DATE_FORMAT)}
      </td>
    )
    cols.push(
      <td key="band" className={classNames("col-band", "band-color")}>
        {entry.band}
      </td>
    )
    cols.push(
      <td key="mode" className="col-mode">
        {entry.mode}
      </td>
    )
    cols.push(
      <td key="call" className="col-call">
        <span className="callsign" style={{ verticalAlign: "middle", display: "inline-block" }}>
          {entry.their.call}&nbsp;
        </span>
        {entry.notes && (
          <Tooltip
            arrow
            title={
              <>
                {entry.notes.map((n, i) => (
                  <p key={i}>{n.note}</p>
                ))}
              </>
            }
          >
            <Error
              fontSize="small"
              sx={{ verticalAlign: "middle", display: "inline-block" }}
              color="warning"
              size="small"
            />
          </Tooltip>
        )}
      </td>
    )
    cols.push(
      <td key="qsl" className="col-qsl">
        {entry?.qsl?.sources?.length ? (
          <Chip label={entry?.qsl?.sources[0].via} color="info" size="small" icon={<QslIcon entry={entry} />} />
        ) : (
          <Chip label={"qso"} color="warning" size="small" icon={<Error />} />
        )}
      </td>
    )
    cols.push(
      <td key="other" className="col-other">
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
    )
  } else {
    cols.push(
      <td key="call" colSpan="4">
        {" "}
        -{" "}
      </td>
    )
    cols.push(
      <td key="qsl">
        <Chip label={"nil"} color="default" size="small" icon={<HearingDisabled />} />
      </td>
    )
    cols.push(
      <td key="other">
        <Button size="small" disabled>
          <PushPinOutlined fontSize="small" />-
        </Button>
      </td>
    )
  }

  return (
    <>
      <Box
        component="tr"
        sx={styles.root}
        className={classNames(
          prefix && selectedPrefix === prefix && "selected",
          num % 2 === 0 ? "even" : "odd",
          `band-${entry?.band}`
        )}
      >
        {cols}
      </Box>
      {prefix && selectedPrefix === prefix
        ? qsos
            .filter((qso) => qso.key !== entry.key)
            .map((qso) => (
              <Box
                component="tr"
                sx={styles.root}
                key={qso.key}
                className={classNames(
                  prefix && selectedPrefix === prefix && "selected",
                  num % 2 === 0 ? "even" : "odd",
                  `band-${qso.band}`
                )}
              >
                <td colSpan="2">&nbsp;</td>
                <td className="col-date">{fmtDateTime(qso.endMillis, DATE_FORMAT)}</td>
                <td className={classNames("col-band", "band-color")}>{qso.band}</td>
                <td className="col-mode">{qso.mode}</td>
                <td className="col-call">
                  <span className="callsign" style={{ verticalAlign: "middle", display: "inline-block" }}>
                    {qso.their.call}&nbsp;
                  </span>
                  {qso.notes && (
                    <Tooltip
                      arrow
                      title={
                        <>
                          {qso.notes.map((n, i) => (
                            <p key={i}>{n.note}</p>
                          ))}
                        </>
                      }
                    >
                      <Error
                        fontSize="small"
                        sx={{ verticalAlign: "middle", display: "inline-block" }}
                        color="warning"
                        size="small"
                      />
                    </Tooltip>
                  )}
                </td>
                <td className="col-qsl">
                  {qso?.qsl?.sources?.length ? (
                    <Chip label={qso.qsl.sources[0].via} color="info" size="small" icon={<QslIcon entry={qso} />} />
                  ) : (
                    <Chip label={"qso"} color="warning" size="small" icon={<Error />} />
                  )}
                </td>
                <td>
                  <Button color="info" size="small" onClick={() => handleSelectEntry(qso)}>
                    <PushPinOutlined fontSize="small" />
                  </Button>
                </td>
              </Box>
            ))
        : null}
    </>
  )
}

function QslIcon(params) {
  const { entry } = params
  const Icon = (entry?.qsl?.sources?.length > 0 && QSL_ICONS[entry.qsl.sources[0]?.via]) ?? QSL_ICONS.default
  return <Icon {...params} />
}
