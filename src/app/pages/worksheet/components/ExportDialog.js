import * as React from 'react'
import { Button, DialogActions, DialogContent, DialogContentText } from '@mui/material'
import { DownloadForOffline } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { generateDXM } from '../../../store/log/actions/generateDXM'
import { selectOurCalls } from '../../../store/entries'

const FILENAME_CLEANUP_REGEX = /[^A-Z0-9]/gi

export function ExportDialog ({ onClose }) {
  const dispatch = useDispatch()
  const ourCalls = useSelector(selectOurCalls)

  const handleDownload = React.useCallback(() => {
    const call = Object.keys(ourCalls)[0] || 'N0CALL'

    dispatch(generateDXM()).then((dxm) => {
      const fileName = `${call.replaceAll(FILENAME_CLEANUP_REGEX, '_')}-ham2k.dxm.xml`

      const blob = new Blob([dxm], { type: 'application/xml;charset=utf-8' })
      const a = document.createElement('a')
      a.download = fileName
      a.href = window.URL.createObjectURL(blob)
      a.click()
    })
  }, [dispatch, ourCalls])

  return (
    <>
      <DialogContent>
        <DialogContentText>
          <p>First click on the "download" button below, to get a copy of the DXM XML file you will be submitting.</p>

          <p>
            <Button sx={{ ml: 3 }} onClick={handleDownload}>
              <DownloadForOffline />&nbsp;&nbsp;Download
            </Button>
          </p>

          <p>Then visit <a href='https://entry.dxmarathon.com/'>entry.dxmarathon.com</a>, click on the "Load file(s)" button and select the file you just downloaded.</p>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </>
  )
}
