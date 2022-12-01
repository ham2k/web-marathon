import { BAND_DARK_COLORS } from "./bandColors"

const commonStyles = {
  "& .callsign": {
    fontFamily: "Monaco, Consolas, 'Courier New', monospace",
    fontSize: "0.93em",
  },
  "& .nice-table": {
    borderCollapse: "collapse",
    "& th": {
      boxSizing: "content-box",
      borderBottom: "1px solid #666",
      margin: 0,
      paddingLeft: "0.5em",
      paddingRight: "0.5em",
    },
    "& td": {
      boxSizing: "content-box",
      margin: 0,
      paddingLeft: "0.5em",
      paddingRight: "0.5em",
    },
    "& tr.totals": {
      borderTop: "1px solid #666",
    },
  },
}

Object.entries(BAND_DARK_COLORS).forEach((entry) => {
  commonStyles[`& .band-colors .band-${entry[0]} .band-color`] = {
    color: `rgb(from ${entry[1]} r g b / 85%)`,
  }
})

export default commonStyles
