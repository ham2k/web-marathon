import React, { forwardRef } from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Link as RouterLink } from "react-router-dom"

import { AppBar, Container, CssBaseline, Link, responsiveFontSizes, Toolbar, Typography } from "@mui/material"

import { makeStyles } from "@mui/styles"
import { createTheme, ThemeProvider } from "@mui/material/styles"

import commonStyles from "./styles/common"

import { ContentRoutes } from "./routes"
import ErrorBoundary from "./components/ErrorBoundary"

const MuiToRouterLinkTranslator = forwardRef((props, ref) => {
  const { href, ...other } = props
  // Map href (MUI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />
})

/* https://material.io/resources/color/ */
let baseTheme = createTheme({
  palette: {
    primary: {
      main: "#546e7a",
    },
    secondary: {
      main: "#757575",
    },
  },

  // Ensure MUI Links use React-Router links as their underlying component
  components: {
    MuiLink: {
      defaultProps: {
        component: MuiToRouterLinkTranslator,
      },
    },
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: MuiToRouterLinkTranslator,
      },
    },
  },
})
baseTheme = responsiveFontSizes(baseTheme)

const useStyles = makeStyles((theme) => ({
  ...commonStyles(theme),

  root: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    "& header": {
      "& .MuiToolbar-root div": {
        flexGrow: 1,
        display: "flex",
        flexDirection: "row",
        justifyContent: "start",
        alignItems: "baseline",
      },
      "& h1": {
        fontWeight: "500 !important",
      },
      "& h1 i": {
        fontStyle: "normal",
        fontWeight: "300 !important",
      },
    },
  },
  toolbar: {
    justifyContent: "space-around",
    [theme.breakpoints.up("xs")]: {
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
    },
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    [theme.breakpoints.up("lg")]: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
  },

  footer: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),

    [theme.breakpoints.down("xs")]: {
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(0.5),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },

    textAlign: "center",
  },
  contentWrapper: {
    flex: 1,
    overflow: "auto",
  },
  content: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    "& h1": {
      fontWeight: "500 !important",
    },
    "& h1 i": {
      fontStyle: "normal",
      fontWeight: "300 !important",
    },
  },
}))

export function App() {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <AppBar position="static" role="banner">
        <Toolbar className={classes.toolbar}>
          <div>
            <Typography component="h1" variant="h4" color="inherit" noWrap className={classes.titleMain}>
              <Link href="/" underline="hover" color="inherit" noWrap>
                <i>Ham2K</i> Marathon Tools
              </Link>
            </Typography>
            <Typography component="div" color="inherit" noWrap className={classes.version}>
              v0.1
            </Typography>
          </div>
        </Toolbar>
      </AppBar>
      <div className={classes.contentWrapper}>
        <Container className={classes.content}>
          <ErrorBoundary>
            <ContentRoutes />
          </ErrorBoundary>
        </Container>
      </div>
      <footer className={classes.footer}>
        <b>Ham2K Marathon Tools</b> developed by <a href="https://www.qrz.com/db/KI2D">KI2D</a> Sebastian Delmont{" "}
        <a href="https://twitter.com/sd">@sd</a> - v0.1
      </footer>
    </div>
  )
}

export function ThemedApp() {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={baseTheme}>
        <App />
      </ThemeProvider>
    </>
  )
}

export default ThemedApp
