import * as React from "react"
import { Routes, Route } from "react-router-dom"
import { HomePage } from "./pages/home"

export function ContentRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}
