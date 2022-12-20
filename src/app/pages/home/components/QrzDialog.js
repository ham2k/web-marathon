import * as React from "react"
import { useDispatch, useSelector } from "react-redux"
import { selectQrzKey, setQrzKey } from "../../../store/settings"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material"
import { Language } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { importFromQRZ } from "../../../store/log"

export function QrzDialog({ onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const key = useSelector(selectQrzKey)

  const [isImporting, setIsImporting] = React.useState(false)
  const [error, setError] = React.useState(undefined)

  const changeKey = (event) => {
    dispatch(setQrzKey({ qrzKey: event.target.value }))
  }

  const handleImport = (event) => {
    setIsImporting(true)
    dispatch(importFromQRZ(setError))
      .then(() => {
        setIsImporting(false)
        onClose()
        navigate(`/worksheet`)
      })
      .catch(() => {
        setIsImporting(false)
      })
  }

  return (
    <>
      <DialogTitle>Import from QRZ</DialogTitle>
      <DialogContent>
        <DialogContentText>Please enter the QRZ.com API Key for the logbook you want to use.</DialogContentText>

        <Box sx={{ pt: 3, pb: 3 }}>
          <TextField label="API Key" variant="outlined" fullWidth value={key ?? ""} onChange={changeKey} />
        </Box>

        {error && <DialogContentText color="error">{error}</DialogContentText>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {isImporting ? (
          <Button onClick={handleImport} disabled>
            Importing...
          </Button>
        ) : (
          <Button onClick={handleImport} disabled={!key || key.length < 19}>
            Import
          </Button>
        )}
      </DialogActions>
    </>
  )
}

export function QrzDialogButton({ label = "Import from QRZ.com" }) {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Language />}
        color="primary"
        component="label"
        size="medium"
        onClick={() => setDialogIsOpen(true)}
      >
        {label}
      </Button>
      <Dialog open={dialogIsOpen} onClose={() => setDialogIsOpen(false)}>
        <QrzDialog onClose={() => setDialogIsOpen(false)} />
      </Dialog>
    </>
  )
}
