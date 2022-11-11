import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  selectCurrentLog,
  selectEntityGroups,
  selectOurCalls,
  selectYearQSOs,
  setCurrentLogInfo,
} from "../../store/log"
import { LogLoader } from "./components/LogLoader"
import { PointsChart } from "./components/PointsChart"
import { selectSettings } from "../../store/settings"
import { EntityList } from "./components/EntityList"
import { fmtNumber } from "@ham2k/util/format"
import { Box, Button, Dialog, Typography } from "@mui/material"
import { Clear, FileDownload } from "@mui/icons-material"
import { selectEntrySelections } from "../../store/entries"
import { ExportDialog } from "./components/ExportDialog"

const styles = {
  root: {
    "& h2": {
      marginTop: "1em",
      borderBottom: "2px solid #333",
    },
  },
}

export function HomePage() {
  const dispatch = useDispatch()
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
    <Box sx={styles.root}>
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

          <PointsChart qson={log} entityGroups={entityGroups} entrySelections={entrySelections} settings={settings} />

          <EntityList qson={log} entityGroups={entityGroups} entrySelections={entrySelections} />
        </>
      ) : (
        <>
          <Typography component="h1" variant="h3">
            Welcome to Ham2K Marathon Tools for {settings?.year}
          </Typography>

          <p>This tool can help you prepare your entry for DX Marathon by analyzing all your QSOs for the year.</p>

          <p>This works best if you provide an ADIF file containing ALL of your QSOs with all possible fields.</p>

          <p>Your files will be processed locally on your own browser, nothing will be uploaded anywhere.</p>

          <Box sx={{ pt: 2 }}>
            <LogLoader title={"Load an ADIF file"} />{" "}
          </Box>
        </>
      )}

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <ExportDialog onClose={() => setExportDialogOpen(false)} />
      </Dialog>
    </Box>
  )
}
