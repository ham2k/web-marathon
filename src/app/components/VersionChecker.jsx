import { Refresh } from '@mui/icons-material'
import { Box } from '@mui/system'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CHECK_PERIODICITY_IN_MILLIS = 4 * 60 * 60 * 1000 // 4 hours

export function VersionChecker () {
  const [serverCommit, setServerCommit] = useState(false)

  useEffect(() => {
    if (window.currentEnv === 'production' && window.currentURL) {
      const intervalId = setInterval(() => {
        fetch(window.currentURL).then(
          (response) => {
            response.text().then((body) => {
              const parts = body.match(/COMMIT: "([A-Za-z0-9]+)"/)
              if (parts && parts[1]) {
                setServerCommit(parts[1])
              }
            })
          },
          (error) => {
            console.error('Error while trying to fetch current server version', error)
          }
        )
      }, CHECK_PERIODICITY_IN_MILLIS)

      // Clear interval on re-render to avoid memory leaks
      return () => {
        clearInterval(intervalId)
      }
    }
  }, [])

  if (window.currentEnv === 'production' && serverCommit && serverCommit !== window.currentCommit) {
    return (
      <Box
        sx={{
          backgroundColor: '#F0F0AA',
          m: 0,
          p: 2,
          display: 'inline-flex',
          verticalAlign: 'middle',
          justifyContent: 'center'
        }}
      >
        There is a newer version of this application. &nbsp;&nbsp; Please&nbsp;&nbsp;
        <Link onClick={() => window.location.reload()} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
          <Refresh /> &nbsp;reload this page
        </Link>
        &nbsp;&nbsp;&nbsp;to update it.
      </Box>
    )
  } else {
    return null
  }
}
