import React, { useCallback, useMemo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { LogLoader } from './components/LogLoader'
import { selectSettings } from '../../store/settings'
import { Box, Button, Typography } from '@mui/material'
import { QrzDialogButton } from './components/QrzDialog'
import { selectOurCalls } from '../../store/entries'
import { Login } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useBuiltinCountryFile, parseCountryFile, setCountryFileData, analyzeFromCountryFile } from '@ham2k/lib-country-files'


const styles = {
  root: {
    '& h2': {
      marginTop: '1em',
      borderBottom: '2px solid #333'
    }
  }
}

export function HomePage () {
  const navigate = useNavigate()
  const settings = useSelector(selectSettings)
  const calls = Object.keys(useSelector(selectOurCalls) ?? {})

  const handleContinue = () => {
    navigate('/worksheet')
  }

  const [dataLoaded, setDataLoaded] = useState()
  useEffect(() => {
    fetch("/country-files/bigcty/cty.csv")
    .then((response) => {
      return response.text()
    }).then((body) => {
      const data = parseCountryFile(body)

      setCountryFileData(data)
      const info = analyzeFromCountryFile({ call: 'VERSION' })
      console.log(`Country Files data donwloaded. Version: ${info.entityName}`)
      setDataLoaded(true)
    })
    .catch(error => {
      console.error('Error loading Country Files data', error)
      useBuiltinCountryFile()
      setDataLoaded(true)
    })
  }, [])

  return (
    <Box sx={styles.root}>
      <Typography component='h1' variant='h3'>
        Welcome to Ham2K Marathon Tools for {settings?.year}!
      </Typography>

      <p>
        This tool can help you prepare your entry for <a href='https://www.dxmarathon.com/'>DX Marathon</a> by analyzing
        all your QSOs for the year. This is an unofficial tool, not endorsed in any way by the DX Marathon Management
        Team or by CQ Magazine. It's meant to help you prepare your entry to the Marathon, but the final result is your
        responsibility. We are not making any claims as to the accuracy of the results and cannot be held liable for any
        impact they might have on your participation in the DX Marathon.
      </p>

      <p>This tool works best if you provide an ADIF file containing ALL of your QSOs with all possible fields.</p>

      <p>Your files will be processed locally on your own browser. Nothing will be uploaded anywhere.</p>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignContent: 'center',
          ml: 'auto',
          mr: 'auto',
          pt: 3,
          flexWrap: 'wrap',
          rowGap: 1,
          columnGap: 1,
          minWidth: '10rem',
          maxWidth: '60rem'
        }}
      >
        <Box sx={{}}>
          <LogLoader disabled={!dataLoaded} title='Load ADIF file(s)' />
        </Box>
        <Box sx={{}}>
          <QrzDialogButton />
        </Box>
        <Box sx={{}}>
          {calls && calls.length > 0
            ? (
              <Button
                variant='contained'
                startIcon={<Login />}
                color='primary'
                component='label'
                size='medium'
                onClick={handleContinue}
                disabled={!dataLoaded}
              >
                Continue with {calls.join(', ')}
              </Button>
              )
            : (
              <Button variant='contained' disabled startIcon={<Login />} color='primary' component='label' size='medium'>
                Continue with …
              </Button>
              )}
        </Box>
      </Box>
    </Box>
  )
}
