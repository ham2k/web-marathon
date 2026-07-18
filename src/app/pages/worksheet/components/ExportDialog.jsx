import * as React from 'react'
import { Button, DialogActions, DialogContent, DialogContentText } from '@mui/material'
import { DownloadForOffline, Sync } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { generateDXM } from '../../../store/log/actions/generateDXM'
import { selectOurCalls } from '../../../store/entries'
import { selectMarathonMode } from '../../../store/settings'

const FILENAME_CLEANUP_REGEX = /[^A-Z0-9]/gi

function compress(string) {
  const byteArray = new TextEncoder().encode(string)
  const cs = new window.CompressionStream('gzip')
  const writer = cs.writable.getWriter()
  writer.write(byteArray)
  writer.close()
  return new Response(cs.readable).arrayBuffer()
}

export function ExportDialog({ onClose }) {
  const dispatch = useDispatch()
  const ourCalls = useSelector(selectOurCalls)
  const marathonMode = useSelector(selectMarathonMode)

  const handleDownload = React.useCallback(() => {
    let call = Object.keys(ourCalls)[0] || 'N0CALL'
    if (marathonMode === 'challenge' && call && call !== 'N0CALL') {
      call = `${call}-challenge`
    }

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
        a.href = `https://entry.dxmarathon.com/?data=${encodeURIComponent(dxmgz64)}&label=Data+from+Ham2K`
        a.click()
      })
    })
  }, [dispatch, ourCalls])

  return (
    <>
      <DialogContent>
        <DialogContentText>
          <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
            To complete a submission, you need to get your data to the<br /><a href='https://entry.dxmarathon.com/'>DX Marathon Official Submission Tool</a>
          </div>
          <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
            Download this "DXM" file, visit <a href='https://entry.dxmarathon.com/'>entry.dxmarathon.com</a> and upload it there.
          </div>

          <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
            <Button onClick={handleDownload}>
              <DownloadForOffline />&nbsp;&nbsp;Download
            </Button>
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            And if you found this app useful, please consider supporting our work at
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href='https://www.buymeacoffee.com/ham2k'>
              <img src='https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png' alt='Buy me a coffee' height='40' />
            </a>
          </div>
        </DialogContentText>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </>
  )
}
