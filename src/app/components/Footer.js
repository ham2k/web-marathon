import React from "react"

import { Box } from "@mui/system"
import { Radio, GitHub } from "@mui/icons-material"

export function Footer({ styles }) {
  return (
    <Box component="footer" sx={styles.footer}>
      <Radio fontSize="small" sx={{ verticalAlign: "baseline", position: "relative", top: "2px" }} />{" "}
      <span title={`${window.currentEnv} ${window.currentCommit.substr(0, 8)}`}>
        Ham2k <b>Marathon Tools</b>
      </span>
      &nbsp;&nbsp;•&nbsp;&nbsp; Developed by <a href="https://www.qrz.com/db/KI2D">KI2D</a> - Sebastian Delmont{" "}
      <a href="https://twitter.com/sd">@sd</a>
      &nbsp;&nbsp;•&nbsp;&nbsp;
      <GitHub fontSize="small" sx={{ verticalAlign: "baseline", position: "relative", top: "4px" }} />
      &nbsp;
      <a href="https://github.com/ham2k/ham2k">github.com/ham2k</a>
    </Box>
  )
}
