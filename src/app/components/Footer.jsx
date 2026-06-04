import React from 'react'
import packageJson from '../../../package.json'

import { Box } from '@mui/system'
import { GitHub } from '@mui/icons-material'

export function Footer ({ styles }) {
  return (
    <Box component='footer' sx={{
      ...styles.footer,
      '& a, & a:link, & a:visited': {
        color: '#222',
        textDecoration: 'none',
        fontWeight: '500'
      },
      '& a:hover, & a:active': {
        color: '#00C',
        textDecoration: 'underline'
      }
    }}>
      <span title={`${packageJson.version} ${window.currentEnv} ${window.currentCommit.substr(0, 7)}`}>
        <a href='https://ham2k.com'>Ham2K: Modern apps for nice hams</a>
      </span>
      &nbsp;&nbsp;•&nbsp;&nbsp;
      Developed by <a href='https://www.qrz.com/db/KI2D'>KI2D Sebastián Delmont</a>{' '}
      &nbsp;&nbsp;•&nbsp;&nbsp;
      <a href='https://github.com/ham2k/web-marathon'><GitHub fontSize='small' sx={{ verticalAlign: 'baseline', position: 'relative', top: '4px' }} /></a>
    </Box>
  )
}
