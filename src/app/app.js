import React, { forwardRef } from "react"
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Link as RouterLink } from "react-router-dom"

import { Box, Container, CssBaseline, responsiveFontSizes } from "@mui/material"

import { createTheme, ThemeProvider } from "@mui/material/styles"

import { ContentRoutes } from "./routes"
import ErrorBoundary from "./components/ErrorBoundary"
import commonStyles from "./styles/common"
import { VersionChecker } from "./components/VersionChecker"
import { Footer } from "./components/Footer"
import { Header } from "./components/Header"

window.currentCommit = window?.ENV?.COMMIT
window.currentEnv = window?.ENV?.NODE_ENV
window.currentURL = window?.ENV?.URL

if (window.currentCommit === "%COMMIT%") window.currentCommit = ""
if (window.currentEnv === "%NODE_ENV%") window.currentEnv = "unknown"
if (window.currentURL === "%URL%") window.currentURL = ""

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

const styles = {
  root: {
    ...commonStyles,

    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    "& header": {
      zIndex: 1,
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
    pl: { xs: 0.5, sm: 1, lg: 3 },
    pr: { xs: 0.5, sm: 1, lg: 3 },
  },

  footer: {
    pt: { xs: 0.5, sm: 1 },
    pb: { xs: 0.5, sm: 1 },
    pl: { xs: 1, sm: 2 },
    pr: { xs: 1, sm: 2 },

    textAlign: "center",
    zIndex: 1,
    boxShadow: "0px 0px 10px 5px rgb(0 0 0 / 12%)",
    "& a, & a:link, & a:visited": {
      color: "#0000AA",
      textDecoration: "none",
    },
    "& a:hover, & a:active": {
      color: "#0000CC",
      textDecoration: "underline",
    },
  },
  contentWrapper: {
    flex: 1,
    overflow: "auto",
  },
  content: {
    pt: 2,
    pb: 2,
    pl: 4,
    "& h1": {
      fontWeight: "500 !important",
    },
    "& h1 i": {
      fontStyle: "normal",
      fontWeight: "300 !important",
    },
  },
}

export function App() {
  return (
    <Box sx={styles.root}>
      <Header styles={styles} />

      <VersionChecker />

      <Box sx={styles.contentWrapper}>
        <Container sx={styles.content}>
          <ErrorBoundary>
            <ContentRoutes />
          </ErrorBoundary>
        </Container>
      </Box>

      <Footer styles={styles} />
    </Box>
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
