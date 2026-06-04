import React from 'react'
import { AppBar, Link, Toolbar, Typography } from '@mui/material'

import packageJson from '../../../package.json'

import ham2kWordmark from '../assets/ham2k-square.svg'

export function Header ({ styles }) {
  return (
    <AppBar position='static' role='banner'>
      <Toolbar sx={styles.toolbar}>
        <div>
          <Typography component='h1' variant='h4' color='inherit' noWrap sx={styles.titleMain}>
            <Link href='/' underline='hover' color='inherit' noWrap>
              <img
                src={ham2kWordmark}
                alt="Ham2K"
                style={{
                  marginLeft: '0.5rem',
                  marginRight: '1rem',
                  // marginTop: '0.5rem',
                  width: '40px',
                  height: 'auto',
                  position: 'relative',
                  verticalAlign: 'middle'
                }}
              />
              Marathon Tools
            </Link>
          </Typography>
          <Typography component='div' color='inherit' noWrap sx={styles.version}>
            &nbsp;&nbsp;Version { packageJson.version }
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
  )
}
