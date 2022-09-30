import { DateTime } from "luxon"

const FORMATS = {
  contestTimestamp: {
    hourCycle: "h23",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  },
  contestTimestampZulu: {
    hourCycle: "h23",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
    timeZone: "Zulu",
  },
  monthYear: {
    year: "numeric",
    month: "long",
  },
  niceDateTime: {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZoneName: "short",
  },
}

const AFTER_FORMATS = {
  contestTimestampZulu: (str) => str.replace(" UTC", "Z"),
}

function dateFormatterGenerator(format) {
  return (dt) => {
    if (dt instanceof Date) {
      dt = DateTime.fromISO(dt.toISOString())
    } else if (typeof dt === "string") {
      dt = DateTime.fromISO(dt)
    } else if (typeof dt === "number") {
      dt = DateTime.fromMillis(dt)
    }
    if (dt) {
      let s = dt.toLocaleString(FORMATS[format])
      if (AFTER_FORMATS[format]) s = AFTER_FORMATS[format](s)

      return s
    } else {
      return ""
    }
  }
}

export function fmtDateTime(dt, format) {
  if (typeof dt === "string") {
    dt = DateTime.fromISO(dt)
  } else if (typeof dt === "number") {
    dt = DateTime.fromMillis(dt)
  }

  if (dt) {
    let s = dt.toLocaleString(FORMATS[format])
    if (AFTER_FORMATS[format]) s = AFTER_FORMATS[format](s)

    return s
  } else {
    return ""
  }
}

export const fmtContestTimestamp = dateFormatterGenerator("contestTimestamp")
export const fmtContestTimestampZulu = dateFormatterGenerator("contestTimestampZulu")
export const fmtDateMonthYear = dateFormatterGenerator("monthYear")

export function fmtMinutesAsHM(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60

  return `${h}h ${m}m`
}
