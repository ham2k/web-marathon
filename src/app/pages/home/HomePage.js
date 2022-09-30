import * as React from "react"
import { makeStyles } from "@mui/styles"
import { useSelector } from "react-redux"
import { selectCurrentLog } from "../../store/log"
import commonStyles from "../../styles/common"
import { LogLoader } from "./components/LogLoader"
import { selectSettings } from "../../store/settings"
import { LogTable } from "./components/LogTable"

const useStyles = makeStyles((theme) => ({
  ...commonStyles(theme),

  root: {
    "& h2": {
      marginTop: "1em",
      borderBottom: "2px solid #333",
    },
  },
}))

export function HomePage() {
  const classes = useStyles()
  const settings = useSelector(selectSettings)
  const log = useSelector(selectCurrentLog)

  return (
    <div className={classes.root}>
      <h1>Welcome to Ham2K Marathon Tools for {settings.year}</h1>
      {log && log.qsos.length > 0 && (
        <div>
          <h2>{log.qsos.length} QSOs</h2>
          <LogTable qson={log} />
        </div>
      )}
      <p>
        <LogLoader title={"Load an ADIF file"} />
      </p>
    </div>
  )
}
