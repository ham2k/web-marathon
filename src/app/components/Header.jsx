import React from 'react'
import { useSelector } from 'react-redux'
import { AppBar, Link, Toolbar, Typography, Box } from '@mui/material'
import { analyzeFromCountryFile } from '@ham2k/lib-country-files'
import { selectCountryFilesLoaded, selectCallListsLoaded, selectCallListsUpdated } from '../store/log'

import packageJson from '../../../package.json'

import ham2kWordmark from '../assets/ham2k-square.svg'

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const d = new Date(timestamp)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function Header ({ styles }) {
  const countryFilesLoaded = useSelector(selectCountryFilesLoaded)
  const callListsLoaded = useSelector(selectCallListsLoaded)
  const callListsUpdated = useSelector(selectCallListsUpdated)

  const ctyVersion = React.useMemo(() => {
    if (!countryFilesLoaded) return 'Loading…'
    try {
      return analyzeFromCountryFile({ call: 'VERSION' })?.entityName || 'Unknown'
    } catch (e) {
      return 'Unknown'
    }
  }, [countryFilesLoaded])

  return (
    <AppBar position='static' role='banner'>
      <Toolbar sx={styles.toolbar}>
        <div>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', flexGrow: 1 }}>
            <Typography component='h1' variant='h4' color='inherit' noWrap sx={styles.titleMain}>
              <Link href='/' underline='hover' color='inherit' noWrap>
                <img
                  src={ham2kWordmark}
                  alt="Ham2K"
                  style={{
                    marginLeft: '0.5rem',
                    marginRight: '1rem',
                    width: '40px',
                    height: 'auto',
                    position: 'relative',
                    verticalAlign: 'middle'
                  }}
                />
                Marathon Tools
              </Link>
            </Typography>
            <Typography component='div' color='inherit' noWrap sx={{ fontSize: '0.875rem', opacity: 0.8, ml: 2 }}>
              Version { packageJson.version }
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.8rem', m: 0, p: 0, gap: 0 }}>
            <Link
              href='https://www.country-files.com/big-cty/'
              target='_blank'
              rel='noopener noreferrer'
              color='inherit'
              underline='hover'
              title='View Country Files website'
              sx={{ lineHeight: 1.1, m: 0, p: 0 }}
            >
              Country Files: {ctyVersion}
            </Link>
            <Link
              href='https://dxmarathon.com/resources/callsign-notes/'
              target='_blank'
              rel='noopener noreferrer'
              color='inherit'
              underline='hover'
              title='View Callsign Notes'
              sx={{ lineHeight: 1.1, m: 0, p: 0 }}
            >
              Good & Bad Calls: {callListsLoaded ? formatDate(callListsUpdated) : 'Loading…'}
            </Link>
          </Box>
        </div>
      </Toolbar>
    </AppBar>
  )
}
