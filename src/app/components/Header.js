import React from "react"

import { AppBar, Link, Toolbar, Typography } from "@mui/material"

export function Header({ styles }) {
  return (
    <AppBar position="static" role="banner">
      <Toolbar sx={styles.toolbar}>
        <div>
          <Typography component="h1" variant="h4" color="inherit" noWrap sx={styles.titleMain}>
            <Link href="/" underline="hover" color="inherit" noWrap>
              <i>Ham2K</i> Marathon Tools
            </Link>
          </Typography>
          <Typography component="div" color="inherit" noWrap sx={styles.version}>
            &nbsp;&nbsp;Version 0.1
          </Typography>
        </div>
      </Toolbar>
    </AppBar>
  )
}
