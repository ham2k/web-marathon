/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button, CircularProgress } from '@mui/material'
import { Box } from '@mui/system'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'

import { clearCurrentLog, loadADIFLog } from '../../../store/log'
import { useNavigate } from 'react-router-dom'

export function LogLoader ({ title, classes }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleFileSelected = (event) => {
    if (event.target.value && event.target.files && event.target.files.length > 0) {
      setLoading(true)
      dispatch(clearCurrentLog()).then(() => {
        setTimeout(() => {
          // without a short timeout, the MUI CircularProgress component fails to render properly.
          let pendingFileCount = event.target.files.length
          for (let i = 0; i < event.target.files.length; i++) {
            const file = event.target.files[i]

            const reader = new FileReader()
            /* eslint-disable no-loop-func */
            /* We do mean to share `pendingFileCount` among all the anonymous functions created inside the loop */
            reader.onload = () => {
              dispatch(loadADIFLog(reader.result, { append: true })).then(() => {
                pendingFileCount--
                if (pendingFileCount === 0) {
                  setLoading(false)
                  navigate('/worksheet')
                }
              })
            }
            /* eslint-enable no-loop-func */
            reader.readAsText(file, 'ISO-8859-1')
          }
          event.target.value = null
        }, 500)
      })
    }
  }

  if (loading) {
    return (
      <Box sx={{ position: 'relative' }} component='span'>
        <Button
          variant='contained'
          disabled
          startIcon={<FolderOpenIcon />}
          color='primary'
          component='label'
          size='medium'
        >
          {title ?? 'Load ADIF Log'}
          <input type='file' hidden multiple onChange={(x) => handleFileSelected(x)} />
        </Button>
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px'
          }}
        />
      </Box>
    )
  } else {
    return (
      <Button variant='contained' startIcon={<FolderOpenIcon />} color='primary' component='label' size='medium'>
        {title ?? 'Load ADIF Log'}
        <input type='file' hidden multiple onChange={(x) => handleFileSelected(x)} />
      </Button>
    )
  }
}
