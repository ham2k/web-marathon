import { getCurrentLocale } from "./locale"

const FORMATS = {
  default: {
    roundingType: "compactRounding",
  },
  integer: {
    roundingType: "fractionDigits",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  oneDecimal: {
    roundingType: "fractionDigits",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  },
}

const locale = getCurrentLocale()

export function fmtNumber(n, format) {
  if (typeof n === "string") {
    n = Number.parseFloat(n)
  }

  return n.toLocaleString(locale, FORMATS[format])
}

function numberFormatterGenerator(format) {
  return (n) => {
    if (typeof n === "string") {
      n = Number.parseFloat(n)
    }

    return n || n === 0 ? n.toLocaleString(locale, FORMATS[format]) : ""
  }
}

export const fmtInteger = numberFormatterGenerator("integer")
export const fmtOneDecimal = numberFormatterGenerator("oneDecimal")

export function fmtPercent(n, format = "oneDecimal") {
  if (typeof n === "string") {
    n = Number.parseFloat(n)
  }
  n = n * 100
  return fmtNumber(n, format) + "%"
}
