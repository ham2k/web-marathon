import * as React from 'react'
import { Button, DialogActions, DialogContent, DialogContentText } from '@mui/material'
import { ContentCopy } from '@mui/icons-material'

export function ExportDialog ({ onClose }) {
  const handlePaste = (event) => {
    const table = document.querySelector('#excel-table')
    const range = document.createRange()
    const sel = window.getSelection()
    sel.removeAllRanges()
    range.selectNodeContents(table)
    sel.addRange(range)
    document.execCommand('copy')
    sel.removeAllRanges()
  }

  return (
    <>
      <DialogContent>
        <DialogContentText>
          <p>First click on the "copy" button below, to place the data on your clipboard.</p>

          <p>
            <Button sx={{ ml: 3 }} onClick={handlePaste}>
              <ContentCopy /> Copy
            </Button>
          </p>

          <p>Then perform the following steps:</p>
          <ol>
            <li>
              Download the latest version of the Submission Form from{' '}
              <a href='https://www.dxmarathon.com/Submission/2022/Submission2022.htm' target='_blank' rel='noreferrer'>
                dxmarathon.com
              </a>
              .
            </li>
            <li>
              Open the official Submission Form scoresheet in Excel or{' '}
              <a href='https://www.openoffice.org/'>OpenOffice</a>.
            </li>
            <li>Click on cell D17 ("Day" for "SMO Malta").</li>
            <li>Select "Paste" from the "Edit" menu.</li>
          </ol>
          <p>
            Your scoresheet should now have all the QSOs you selected in this tool. Fill the rest of the information and
            follow any additional instructions from the{' '}
            <a href='https://www.dxmarathon.com/Submission/2022/Submission2022.htm' target='_blank' rel='noreferrer'>
              Marathon Submission Page
            </a>
            .
          </p>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </>
  )
}
