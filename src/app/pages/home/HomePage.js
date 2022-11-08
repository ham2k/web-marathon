import * as React from "react"
import { makeStyles } from "@mui/styles"
import { useDispatch, useSelector } from "react-redux"
import {
  selectCurrentLog,
  selectEntityGroups,
  selectOurCalls,
  selectYearQSOs,
  setCurrentLogInfo,
} from "../../store/log"
import commonStyles from "../../styles/common"
import { LogLoader } from "./components/LogLoader"
import { selectSettings } from "../../store/settings"
import { EntityList } from "./components/EntityList"
import { fmtNumber } from "@ham2k/util/format"
import { Button, Dialog, Typography } from "@mui/material"
import { Clear, FileDownload } from "@mui/icons-material"
import { selectEntrySelections } from "../../store/entries"
import { ExportDialog } from "./components/ExportDialog"

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
  const dispatch = useDispatch()
  const classes = useStyles()
  const settings = useSelector(selectSettings)
  const log = useSelector(selectCurrentLog)
  const qsos = useSelector(selectYearQSOs)
  const entityGroups = useSelector(selectEntityGroups)
  const entrySelections = useSelector(selectEntrySelections)
  const ourCalls = useSelector(selectOurCalls)

  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)

  const handleClearLog = (event) => {
    dispatch(setCurrentLogInfo({}))
  }

  return (
    <div className={classes.root}>
      {log && log.qsos.length > 0 ? (
        <>
          <Typography component="h1" variant="h3">
            <span style={{ float: "right" }}>
              <Button onClick={() => setExportDialogOpen(true)}>
                <FileDownload /> Export
              </Button>
            </span>
            <i>{fmtNumber(qsos.length)} QSOs for</i> {Object.keys(ourCalls).join(", ")} <i>in</i> {settings?.year}
            <span>
              <Button onClick={handleClearLog}>
                <Clear /> Reset
              </Button>
            </span>
          </Typography>

          <EntityList qson={log} entityGroups={entityGroups} entrySelections={entrySelections} />
        </>
      ) : (
        <>
          <Typography component="h1" variant="h3">
            Welcome to Ham2K Marathon Tools for {settings?.year}
          </Typography>

          <p>This tool can help you prepare your entry for DX Marathon by analyzing all your QSOs for the year.</p>

          <p>Your files will be processed locally on your own browser, nothing will be uploaded anywhere.</p>

          <p>
            <LogLoader title={"Load an ADIF file"} />
          </p>
        </>
      )}

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <ExportDialog onClose={() => setExportDialogOpen(false)} />
      </Dialog>
    </div>
  )
}
