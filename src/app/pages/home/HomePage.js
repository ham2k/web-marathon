import * as React from "react"
import { useSelector } from "react-redux"
import { LogLoader } from "./components/LogLoader"
import { selectSettings } from "../../store/settings"
import { Box, Typography } from "@mui/material"

const styles = {
  root: {
    "& h2": {
      marginTop: "1em",
      borderBottom: "2px solid #333",
    },
  },
}

export function HomePage() {
  const settings = useSelector(selectSettings)

  return (
    <Box sx={styles.root}>
      <Typography component="h1" variant="h3">
        Welcome to Ham2K Marathon Tools for {settings?.year}
      </Typography>

      <p>
        This tool can help you prepare your entry for <a href="https://www.dxmarathon.com/">DX Marathon</a> by analyzing
        all your QSOs for the year. This is an unofficial tool, not endorsed in any way by the DX Marathon Management
        Team or by CQ Magazine. It's meant to help you prepare your entry to the Marathon, but the final result is your
        responsibility. We are not making any claims as to the accuracy of the results and cannot be held liable for any
        impact they might have on your participation in the DX Marathon.
      </p>

      <p>This tool works best if you provide an ADIF file containing ALL of your QSOs with all possible fields.</p>

      <p>Your files will be processed locally on your own browser. Nothing will be uploaded anywhere.</p>

      <Box sx={{ pt: 2 }}>
        <LogLoader title={"Load an ADIF file"} />{" "}
      </Box>
    </Box>
  )
}
