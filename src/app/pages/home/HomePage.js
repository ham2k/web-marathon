import { makeStyles } from "@mui/styles"
import * as React from "react"
import commonStyles from "../../styles/common"

const useStyles = makeStyles((theme) => ({
  ...commonStyles(theme),

  root: {
    "& h2": {
      marginTop: "1em",
      borderBottom: "2px solid #333",
    },
  },
}))

export function HomePage() {
  const classes = useStyles()

  return (
    <div class={classes.root}>
      <h1>Welcome to Ham2K Marathon Tools</h1>
    </div>
  )
}
