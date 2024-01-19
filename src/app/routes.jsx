import * as React from 'react'
import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/home'
import { WorksheetPage } from './pages/worksheet'

export function ContentRoutes () {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/worksheet' element={<WorksheetPage />} />
    </Routes>
  )
}
