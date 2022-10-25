import * as React from "react"
import { makeStyles } from "@mui/styles"
import { useSelector } from "react-redux"
import { selectCurrentLog, selectYearQSOs } from "../../store/log"
import commonStyles from "../../styles/common"
import { LogLoader } from "./components/LogLoader"
import { selectSettings } from "../../store/settings"
import { EntityList } from "./components/EntityList"
import { fmtNumber } from "@ham2k/util/format"
import { Button } from "@mui/material"
import { ContentCopy } from "@mui/icons-material"

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
  const qsos = useSelector(selectYearQSOs)

  const handlePaste = (event) => {
    let table = document.querySelector("#excel-table")
    let range = document.createRange()
    let sel = window.getSelection()
    sel.removeAllRanges()
    range.selectNodeContents(table)
    sel.addRange(range)
    document.execCommand("copy")
    sel.removeAllRanges()
  }

  return (
    <div className={classes.root}>
      <h1>Welcome to Ham2K Marathon Tools for {settings?.year}</h1>
      {log && log.qsos.length > 0 && (
        <div>
          <h2>
            {fmtNumber(qsos.length)} QSOs in {settings?.year}
            <span style={{ float: "right" }}>
              <Button>
                <ContentCopy onClick={handlePaste} />
              </Button>
            </span>
          </h2>
          <EntityList qson={log} />
        </div>
      )}
      <p>
        <LogLoader title={"Load an ADIF file"} />
      </p>
    </div>
  )
}
