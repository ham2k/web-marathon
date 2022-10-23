/* eslint-disable no-unused-vars */
import React from "react"
import { Button } from "@mui/material"
import FolderOpenIcon from "@mui/icons-material/FolderOpen"
import ClearIcon from "@mui/icons-material/Clear"
import { useDispatch, useSelector } from "react-redux"
import { loadADIFLog, selectCurrentLog, setCurrentLogInfo } from "../../../store/log"

export function LogLoader({ title, classes }) {
  const dispatch = useDispatch()
  const log = useSelector(selectCurrentLog)

  const handleFileSelected = (event) => {
    if (event.target.value) {
      const file = event.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        dispatch(loadADIFLog(reader.result))
      }
      reader.readAsText(file)
      event.target.value = null
    }
  }

  const handleClearLog = (event) => {
    dispatch(setCurrentLogInfo({}))
  }

  return (
    <>
      <Button variant="contained" startIcon={<FolderOpenIcon />} color="primary" component="label" size="medium">
        {title || "Load ADIF Log"}
        <input type="file" hidden onChange={(x) => handleFileSelected(x)} />
      </Button>
      {log && log.qsos && (
        <Button
          variant="contained"
          startIcon={<ClearIcon />}
          color="secondary"
          component="label"
          size="medium"
          style={{ marginLeft: "10px" }}
          onClick={handleClearLog}
        >
          Clear Current Log
        </Button>
      )}
    </>
  )
}
