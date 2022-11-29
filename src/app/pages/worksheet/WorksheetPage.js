import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  selectCurrentLog,
  selectEntityGroups,
  selectOurCalls,
  selectYearQSOs,
  setCurrentLogInfo,
} from "../../store/log"
import { PointsChart } from "./components/PointsChart"
import { selectSettings } from "../../store/settings"
import { EntityList } from "./components/EntityList"
import { fmtNumber } from "@ham2k/util/format"
import { Box, Button, Dialog, Typography } from "@mui/material"
import { Clear, FileDownload } from "@mui/icons-material"
import { selectEntrySelections } from "../../store/entries"
import { ExportDialog } from "./components/ExportDialog"
import { useNavigate } from "react-router-dom"

const styles = {
  root: {
    "& h2": {
      marginTop: "1em",
      borderBottom: "2px solid #333",
    },
  },
}

export function WorksheetPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const settings = useSelector(selectSettings)
  const log = useSelector(selectCurrentLog)
  const qsos = useSelector(selectYearQSOs)
  const entityGroups = useSelector(selectEntityGroups)
  const entrySelections = useSelector(selectEntrySelections)
  const ourCalls = useSelector(selectOurCalls)

  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)

  const handleClearLog = (event) => {
    dispatch(setCurrentLogInfo({}))
    navigate(`/`)
  }

  return (
    <Box sx={styles.root}>
      <Typography component="h1" variant="h3">
        <span style={{ float: "right" }}>
          <Button onClick={() => setExportDialogOpen(true)}>
            <FileDownload /> Export
          </Button>
        </span>
        <i>{fmtNumber(qsos.length)} QSOs</i>
        {Object.keys(ourCalls).length > 0 && (
          <>
            <i> for</i> {Object.keys(ourCalls).join(", ")}
          </>
        )}
        <i> in</i> {settings?.year}
        <span>
          <Button onClick={handleClearLog}>
            <Clear /> Reset
          </Button>
        </span>
      </Typography>

      <PointsChart qson={log} entityGroups={entityGroups} entrySelections={entrySelections} settings={settings} />

      <EntityList qson={log} entityGroups={entityGroups} entrySelections={entrySelections} />

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <ExportDialog onClose={() => setExportDialogOpen(false)} />
      </Dialog>
    </Box>
  )
}
