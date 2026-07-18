import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Dialog, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { Clear, FileDownload } from '@mui/icons-material'

import { fmtNumber } from '@ham2k/lib-format-tools'

import { clearCurrentLog, fetchCurrentLog, fetchCallLists, selectEntityGroups, selectYearQSOs } from '../../store/log'
import { selectEntrySelections, selectOurCalls } from '../../store/entries'
import { selectSettings } from '../../store/settings'
import { PointsChart } from './components/PointsChart'
import { EntityList } from './components/EntityList'
import { ExportDialog } from './components/ExportDialog'
import { CQWWEntities, CQZones } from '../../../data/entities'

const styles = {
  root: {
    '& h2': {
      marginTop: '1em',
      borderBottom: '2px solid #333'
    }
  }
}

const SIMPLIFIED_MODES = {
  CW: 'CW',
  SSB: 'PHONE',
  USB: 'PHONE',
  LSB: 'PHONE',
  AM: 'PHONE',
  FM: 'PHONE',
  PH: 'PHONE',
  DIGITALVOICE: 'PHONE',
  C4FM: 'PHONE',
  DMR: 'PHONE',
  DSTAR: 'PHONE',
  PHONE: 'PHONE'
}

function simplifyMode (mode) {
  if (!mode) return 'DIGITAL'
  mode = mode.toUpperCase()
  return SIMPLIFIED_MODES[mode] || 'DIGITAL'
}

export function WorksheetPage () {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const settings = useSelector(selectSettings)
  const qsos = useSelector(selectYearQSOs)
  const entityGroups = useSelector(selectEntityGroups)
  const entrySelections = useSelector(selectEntrySelections)
  const ourCalls = useSelector(selectOurCalls)

  const [exportDialogOpen, setExportDialogOpen] = React.useState(false)
  const [bandFilter, setBandFilter] = React.useState('All Bands')
  const [modeFilter, setModeFilter] = React.useState('Mixed')

  useEffect(() => {
    dispatch(fetchCallLists())
    dispatch(fetchCurrentLog())
  }, [dispatch])

  const handleClearLog = (event) => {
    dispatch(clearCurrentLog({}))
    navigate('/')
  }

  const modeCounts = React.useMemo(() => {
    const counts = { Mixed: 0, CW: 0, Phone: 0, Digital: 0 }
    if (!qsos) return counts
    counts.Mixed = qsos.length
    qsos.forEach((qso) => {
      const m = simplifyMode(qso.mode)
      if (m === 'CW') counts.CW += 1
      else if (m === 'PHONE') counts.Phone += 1
      else if (m === 'DIGITAL') counts.Digital += 1
    })
    return counts
  }, [qsos])

  const qsosFilteredByMode = React.useMemo(() => {
    if (!qsos) return []
    if (modeFilter === 'Mixed') return qsos
    return qsos.filter((qso) => simplifyMode(qso.mode) === modeFilter.toUpperCase())
  }, [qsos, modeFilter])

  const bandCounts = React.useMemo(() => {
    const counts = {
      'All Bands': qsosFilteredByMode.length,
      '160m': 0, '80m': 0, '60m': 0, '40m': 0, '30m': 0,
      '20m': 0, '17m': 0, '15m': 0, '12m': 0, '10m': 0, '6m': 0
    }
    qsosFilteredByMode.forEach((qso) => {
      if (counts[qso.band] !== undefined) {
        counts[qso.band] += 1
      }
    })
    return counts
  }, [qsosFilteredByMode])

  const filteredQSOs = React.useMemo(() => {
    let list = qsos ?? []
    if (bandFilter !== 'All Bands') {
      list = list.filter((q) => q.band === bandFilter)
    }
    if (modeFilter !== 'Mixed') {
      list = list.filter((q) => simplifyMode(q.mode) === modeFilter.toUpperCase())
    }
    return list
  }, [qsos, bandFilter, modeFilter])

  const filteredEntityGroups = React.useMemo(() => {
    const filtered = {}
    Object.keys(entityGroups).forEach((prefix) => {
      let list = entityGroups[prefix] ?? []
      if (bandFilter !== 'All Bands') {
        list = list.filter((q) => q.band === bandFilter)
      }
      if (modeFilter !== 'Mixed') {
        list = list.filter((q) => simplifyMode(q.mode) === modeFilter.toUpperCase())
      }
      filtered[prefix] = list
    })
    return filtered
  }, [entityGroups, bandFilter, modeFilter])

  const counts = React.useMemo(() => {
    const memoCounts = {
      entities: 0,
      zones: 0
    }

    CQWWEntities.forEach((entity) => {
      const key = entrySelections[entity.entityPrefix]
      const qsos = filteredEntityGroups[entity.entityPrefix] ?? []
      const entry = (key && qsos.find((qso) => qso.key === key)) ?? qsos[0]
      if (entry) {
        memoCounts.entities += 1
      }
    })

    CQZones.forEach((zone) => {
      const key = entrySelections[zone.entityPrefix]
      const qsos = filteredEntityGroups[zone.entityPrefix] ?? []
      const entry = qsos.find((qso) => qso.key === key) ?? qsos[0]
      if (entry) {
        memoCounts.zones += 1
      }
    })

    return memoCounts
  }, [entrySelections, filteredEntityGroups])

  if (!qsos) {
    return undefined
  }

  return (
    <Box sx={styles.root}>
      <Typography component='h1' variant='h3'>
        <span style={{ float: 'right' }}>
          <Button onClick={() => setExportDialogOpen(true)}>
            <FileDownload /> Generate Submission
          </Button>
        </span>
        <i>{fmtNumber(qsos.length)} QSOs</i>
        {Object.keys(ourCalls).length > 0 && (
          <>
            <i> for</i> {Object.keys(ourCalls).join(', ')}
          </>
        )}
        <i> in</i> {settings?.year}
        <span>
          <Button onClick={handleClearLog}>
            <Clear /> Reset
          </Button>
        </span>
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size='small' style={{ minWidth: 180 }}>
            <InputLabel id='mode-filter-label'>Mode</InputLabel>
            <Select
              labelId='mode-filter-label'
              value={modeFilter}
              label='Mode'
              onChange={(e) => {
                setModeFilter(e.target.value)
                setBandFilter('All Bands') // Reset band filter when mode changes to prevent zero matches
              }}
            >
              <MenuItem value='Mixed'>Mixed ({modeCounts.Mixed})</MenuItem>
              <MenuItem value='CW'>CW ({modeCounts.CW})</MenuItem>
              <MenuItem value='Phone'>Phone ({modeCounts.Phone})</MenuItem>
              <MenuItem value='Digital'>Digital ({modeCounts.Digital})</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' style={{ minWidth: 180 }}>
            <InputLabel id='band-filter-label'>Band</InputLabel>
            <Select
              labelId='band-filter-label'
              value={bandFilter}
              label='Band'
              onChange={(e) => setBandFilter(e.target.value)}
            >
              <MenuItem value='All Bands'>All Bands ({bandCounts['All Bands']})</MenuItem>
              <MenuItem value='160m'>160m ({bandCounts['160m']})</MenuItem>
              <MenuItem value='80m'>80m ({bandCounts['80m']})</MenuItem>
              <MenuItem value='60m'>60m ({bandCounts['60m']})</MenuItem>
              <MenuItem value='40m'>40m ({bandCounts['40m']})</MenuItem>
              <MenuItem value='30m'>30m ({bandCounts['30m']})</MenuItem>
              <MenuItem value='20m'>20m ({bandCounts['20m']})</MenuItem>
              <MenuItem value='17m'>17m ({bandCounts['17m']})</MenuItem>
              <MenuItem value='15m'>15m ({bandCounts['15m']})</MenuItem>
              <MenuItem value='12m'>12m ({bandCounts['12m']})</MenuItem>
              <MenuItem value='10m'>10m ({bandCounts['10m']})</MenuItem>
              <MenuItem value='6m'>6m ({bandCounts['6m']})</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Typography variant='h5' style={{ fontWeight: 'bold' }}>
          {counts.entities + counts.zones} claimed points:&nbsp;
          <span style={{ fontWeight: 'normal', fontSize: '0.9em', color: '#666' }}>
            {counts.entities} Entities + {counts.zones} Zones
          </span>
        </Typography>
      </Box>

      <PointsChart qsos={filteredQSOs} entityGroups={filteredEntityGroups} entrySelections={entrySelections} settings={settings} />

      <EntityList qsos={filteredQSOs} entityGroups={filteredEntityGroups} entrySelections={entrySelections} />

      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <ExportDialog onClose={() => setExportDialogOpen(false)} />
      </Dialog>
    </Box>
  )
}
