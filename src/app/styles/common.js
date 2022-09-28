import { BAND_COLORS } from "./bandColors"

const commonStyles = (theme) => {
  const styles = {
    pageRoot: {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "flex-start",
      flex: 1,

      maxHeight: "100%",
    },
    pageHeader: {
      flex: 0,
    },
    pageFooter: {
      flex: 0,
    },

    sectionRoot: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
    },

    sectionHeader: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      zIndex: 100,
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      paddingLeft: 0,
      paddingRight: 0,
      "& .MuiTypography-h2": {
        fontSize: "1rem",
        fontWeight: "bold",
      },
      "& .MuiTypography-h3": {
        fontSize: "1rem",
        fontWeight: "normal",
      },
    },

    sectionIcon: {
      fontSize: 30,
      marginLeft: theme.spacing(0),
      marginRight: theme.spacing(1),
      [theme.breakpoints.down("sm")]: {
        fontSize: 24,
      },
    },

    overflowContainer: {
      overflow: "hidden",
      minHeight: 0,
    },

    niceTable: {
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

  styles.bandColors = {}
  Object.entries(BAND_COLORS).forEach((entry) => {
    styles.bandColors[`& .band-${entry[0]} .band-color`] = {
      color: entry[1],
      filter: "brightness(0.85)",
    }
    styles.bandColors[`& .band-${entry[0]} .band-bgcolor`] = {
      backgroundColor: entry[1],
    }
  })

  return styles
}

export default commonStyles
