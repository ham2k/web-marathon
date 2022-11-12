/* eslint-disable no-unused-vars */
import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button, CircularProgress } from "@mui/material"
import { Box } from "@mui/system"
import FolderOpenIcon from "@mui/icons-material/FolderOpen"

import { loadADIFLog, setCurrentLogInfo } from "../../../store/log"

export function LogLoader({ title, classes }) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const handleFileSelected = (event) => {
    if (event.target.value) {
      setLoading(true)

      setTimeout(() => {
        // without a short timeout, the MUI CircularProgress component fails to render properly.

        const file = event.target.files[0]
        const reader = new FileReader()
        reader.onload = () => {
          dispatch(loadADIFLog(reader.result)).then(() => setLoading(false))
        }
        reader.readAsText(file, "ISO-8859-1")
        event.target.value = null
      }, 500)
    }
  }

  const handleClearLog = (event) => {
    dispatch(setCurrentLogInfo({}))
  }

  if (loading) {
    return (
      <Box sx={{ position: "relative" }} component="span">
        <Button
          variant="contained"
          disabled
          startIcon={<FolderOpenIcon />}
          color="primary"
          component="label"
          size="medium"
        >
          {title || "Load ADIF Log"}
          <input type="file" hidden onChange={(x) => handleFileSelected(x)} />
        </Button>
        <CircularProgress
          size={24}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: "-12px",
            marginLeft: "-12px",
          }}
        />
      </Box>
    )
  } else {
    return (
      <Button variant="contained" startIcon={<FolderOpenIcon />} color="primary" component="label" size="medium">
        {title || "Load ADIF Log"}
        <input type="file" hidden onChange={(x) => handleFileSelected(x)} />
      </Button>
    )
  }
}
