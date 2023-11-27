import * as React from 'react'
import { Button, DialogActions, DialogContent, DialogContentText } from '@mui/material'
import { DownloadForOffline, Sync } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { generateDXM } from '../../../store/log/actions/generateDXM'
import { selectOurCalls } from '../../../store/entries'

const FILENAME_CLEANUP_REGEX = /[^A-Z0-9]/gi

function compress (string) {
  const byteArray = new TextEncoder().encode(string)
  const cs = new window.CompressionStream('gzip')
  const writer = cs.writable.getWriter()
  writer.write(byteArray)
  writer.close()
  return new Response(cs.readable).arrayBuffer()
}

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

  const handleLink = React.useCallback(() => {
    dispatch(generateDXM()).then((dxm) => {
      compress(dxm).then((dxmgz) => {
        const dxmgz64 = btoa(String.fromCharCode.apply(null, new Uint8Array(dxmgz)))
        const a = document.createElement('a')
        a.href = `http://localhost:5023/?data=${encodeURIComponent(dxmgz64)}&label=Data+from+Ham2K`
        a.click()
      })
    })
  }, [dispatch, ourCalls])

  return (
    <>
      <DialogContent>
        <DialogContentText>
          <div style={{ marginBottom: '0.5rem' }}>
            You need to get your data to the <a href='https://entry.dxmarathon.com/'>DX Marathon Official Submission Tool</a>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            You can download a "DXM XML" file and manually upload at <a href='https://entry.dxmarathon.com/'>entry.dxmarathon.com</a>
          </div>

          <Button sx={{ ml: 3 }} onClick={handleDownload}>
            <DownloadForOffline />&nbsp;&nbsp;Download
          </Button>

          <div style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>
            Or you can send the data directly to the Official Submission Tool by clicking on the button below.
          </div>
          <Button sx={{ ml: 3 }} onClick={handleLink}>
            <Sync />&nbsp;&nbsp;Send Directly to DX Marathon
          </Button>
        </DialogContentText>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </>
  )
}
