import * as React from "react"
import { useSelector } from "react-redux"
import { selectEntityGroups, selectYearQSOs } from "../../../store/log"
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material"
import { ContentCopy, FileDownload } from "@mui/icons-material"
import generateExcel from "../../../tools/generateExcel"
import { selectEntrySelections } from "../../../store/entries"
import { Box } from "@mui/system"

export function ExportDialog({ onClose }) {
  const qsos = useSelector(selectYearQSOs)
  const entityGroups = useSelector(selectEntityGroups)
  const entrySelections = useSelector(selectEntrySelections)
  const [exportReady, setExportReady] = React.useState(false)

  const handlePaste = (event) => {
    let table = document.querySelector("#excel-table")
    let range = document.createRange()
    let sel = window.getSelection()
    sel.removeAllRanges()
    range.selectNodeContents(table)
    sel.addRange(range)
    document.execCommand("copy")
    sel.removeAllRanges()
    setExportReady("clipboard")
  }

  const handleDownload = (event) => {
    const lastQSO = qsos[qsos.length - 1]

    const entrant = {
      call: lastQSO.our.call,
      cqZone: lastQSO.our.cqZone,
      name: lastQSO.our.name,
      street: "123 Main St.",
      city: lastQSO.our.city,
      state: lastQSO.our.state,
      country: lastQSO.our.country,
      postal: "65432",
      email: `${lastQSO.our.call}@arrl.org`,
      club: "DX Marathon Managers",
      class: "U",
      notes: "This is a sample entry generated by Ham2K Marathon Tools",
    }

    generateExcel({ entityGroups, entrySelections, entrant })
    setExportReady("file")
  }

  return (
    <div>
      <DialogTitle>Export your DX Marathon Score Sheet</DialogTitle>
      {!exportReady && (
        <>
          <DialogContent>
            <DialogContentText sx={{ textAlign: "center" }}>
              <p>You have two ways of preparing your score sheet:</p>
              <Box sx={{ pt: 3 }}>Copy the entries manually into Excel:</Box>
              <p>
                <Button onClick={handlePaste}>
                  <ContentCopy /> Copy
                </Button>
              </p>
              <Box sx={{ pt: 3 }}>Or Download a generated XLS file:</Box>
              <p>
                <Button onClick={handleDownload}>
                  <FileDownload /> Download
                </Button>{" "}
              </p>
              <p>
                This method does not work correctly right now!!!
                <br />
                Use only for testing.
              </p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
          </DialogActions>
        </>
      )}
      {exportReady === "file" && (
        <>
          <DialogContent>
            <DialogContentText>
              <p>Your XLS score sheet has been generated and is being downloaded on your browser</p>
              <p style={{ textDecoration: "line-through" }}>
                Please note that while this file is a simplified version of the official score sheet, it is believed to
                work just fine with the DX Marathon submission and scoring process
              </p>
              <p>
                <b>
                  Be warned that the file you downloaded will not work for direct submission. This feature is here so
                  that we can continue testing it while we work on it!
                </b>
              </p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Done</Button>
          </DialogActions>
        </>
      )}
      {exportReady === "clipboard" && (
        <>
          <DialogContent>
            <DialogContentText>
              <p>Your entries have been copied to the clipboard. Now perform the following steps:</p>
              <ol>
                <li>Open the official score sheet in Excel</li>
                <li>Click on cell D17 ("Day" for "SMO Malta")</li>
                <li>Select "Paste" from the "Edit" menu</li>
                <li>Save the file</li>
              </ol>
              <p>You should now have an XLS score sheet ready to be submitted.</p>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Done</Button>
          </DialogActions>
        </>
      )}
    </div>
  )
}