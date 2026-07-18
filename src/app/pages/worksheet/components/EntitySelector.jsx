import React, { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Box, Button, TextField, Chip, Tooltip, Typography } from '@mui/material'
import { CheckCircleRounded, Error, ThumbUp, ThumbDown, Feedback } from '@mui/icons-material'
import classNames from 'classnames'

import { fmtDateTime } from '@ham2k/lib-format-tools'
import { setSelection, selectEntrySelections } from '../../../store/entries'
import { DATE_FORMAT } from './EntityEntry'
import { getSelectedEntry } from '../../../tools/getSelectedEntry'

const styles = {
  root: {
    margin: '0.5rem 1rem 1rem 1rem',
    paddingBottom: '20px',
    '& table': {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%',
      maxWidth: '45rem',
      borderCollapse: 'collapse',
      marginTop: '1em',
      '& th': {
        borderBottom: '1px solid #ccc',
        padding: '2px 8px',
        textAlign: 'left'
      },
      '& td': {
        borderBottom: '1px solid #eee',
        padding: '2px 8px',
        textAlign: 'left'
      },
      '& .col-edit': {
        textAlign: 'center'
      }
    }
  }
}

const MINIMUM_SEARCH_LENGTH = 3

const renderStatusIcon = (type, insideTooltip = false) => {
  let bgColor = ''
  let IconComponent = null

  if (type === 'good') {
    bgColor = '#4caf50' // green
    IconComponent = ThumbUp
  } else if (type === 'bad') {
    bgColor = '#d32f2f' // red
    IconComponent = ThumbDown
  } else {
    bgColor = '#ed6c02' // orange
    IconComponent = Feedback
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: '#fff',
        verticalAlign: 'middle',
        ml: insideTooltip ? 0 : 0.5,
        flexShrink: 0
      }}
    >
      <IconComponent sx={{ fontSize: '0.75rem' }} />
    </Box>
  )
}

const renderTooltipNote = (n, i) => {
  let iconType = 'warning'
  if (n.about === 'goodCall') iconType = 'good'
  else if (n.about === 'badCall') iconType = 'bad'

  return (
    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.75 }}>
      {renderStatusIcon(iconType, true)}
      <Typography variant="body2" sx={{ fontSize: '0.75rem', whiteSpace: 'pre-line', color: 'inherit' }}>
        {n.note}
      </Typography>
    </Box>
  )
}

export function EntitySelector({
  entity,
  qsos: defaultQSOs,
  yearQSOs,
  setSelectedPrefix,
  marathonMode,
  activeBand
}) {
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const entrySelections = useSelector(selectEntrySelections)

  const keyPrefix = marathonMode === 'challenge' && activeBand ? `${entity.entityPrefix}-${activeBand}` : entity.entityPrefix
  const currentSelectionKey = entrySelections[keyPrefix]

  const [qsos, warnings] = useMemo(() => {
    let filteredQSOs = []
    const warnings = {}

    if (search.length >= MINIMUM_SEARCH_LENGTH) {
      filteredQSOs = (yearQSOs ?? []).filter(
        (qso) => (qso?.their?.call?.indexOf(search) ?? -1) >= 0
      )
    } else {
      filteredQSOs = defaultQSOs ?? []
    }

    // Ensure the current selection is at the top of the list if it's not already there
    const currentSelectedQSO = (yearQSOs ?? []).find(qso => qso.key === currentSelectionKey)
    if (currentSelectedQSO && !filteredQSOs.some(q => q.key === currentSelectionKey)) {
      filteredQSOs = [currentSelectedQSO, ...filteredQSOs]
    }

    // Label the auto-selected QSO if no manual selection is active
    const autoSelectedQSO = !currentSelectionKey
      ? getSelectedEntry(defaultQSOs, currentSelectionKey, entrySelections, keyPrefix, yearQSOs)
      : null
    if (autoSelectedQSO) {
      warnings[autoSelectedQSO.key] = 'Auto selected'
    }

    const entrySelectionsReverseMap = {}
    Object.keys(entrySelections).forEach((prefix) => {
      const qsoKey = entrySelections[prefix]
      if (qsoKey) {
        entrySelectionsReverseMap[qsoKey] = prefix
      }
    })

    filteredQSOs.forEach((qso) => {
      const assignedPrefixKey = entrySelectionsReverseMap[qso.key]
      if (assignedPrefixKey) {
        if (assignedPrefixKey === keyPrefix) {
          warnings[qso.key] = 'Current selection'
        } else {
          let displayLabel = assignedPrefixKey
          if (marathonMode === 'challenge') {
            const hyphenIndex = assignedPrefixKey.lastIndexOf('-')
            const prefix = hyphenIndex >= 0 ? assignedPrefixKey.substring(0, hyphenIndex) : assignedPrefixKey
            const band = hyphenIndex >= 0 ? assignedPrefixKey.substring(hyphenIndex + 1) : ''
            displayLabel = `${prefix} on ${band}`
          }
          warnings[qso.key] = `Selected for ${displayLabel}`
        }
      }
    })

    return [filteredQSOs, warnings]
  }, [search, yearQSOs, entity, defaultQSOs, currentSelectionKey, entrySelections, keyPrefix, marathonMode])

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value.toUpperCase())
  }, [])

  const handleSelectEntry = useCallback((qso) => {
    const selectedCall = qso?.their?.call
    if (selectedCall) {
      const yearQsoMap = new Map()
      if (yearQSOs) {
        yearQSOs.forEach(q => {
          if (q && q.key) {
            yearQsoMap.set(q.key, q)
          }
        })
      }

      Object.keys(entrySelections).forEach((prefixKey) => {
        const selectionKey = entrySelections[prefixKey]
        if (selectionKey && selectionKey !== 'X') {
          const existingQSO = yearQsoMap.get(selectionKey)
          if (existingQSO && existingQSO.their?.call === selectedCall) {
            let isDifferent = false
            if (marathonMode === 'challenge' && activeBand) {
              const hyphenIndex = prefixKey.lastIndexOf('-')
              const existingPrefix = hyphenIndex >= 0 ? prefixKey.substring(0, hyphenIndex) : prefixKey
              const existingBand = hyphenIndex >= 0 ? prefixKey.substring(hyphenIndex + 1) : ''
              
              if (existingBand === qso.band && existingPrefix !== entity.entityPrefix) {
                isDifferent = true
              }
            } else {
              if (prefixKey !== entity.entityPrefix) {
                isDifferent = true
              }
            }

            if (isDifferent) {
              dispatch(setSelection({ prefix: prefixKey, key: undefined }))
            }
          }
        }
      })
    }

    dispatch(setSelection({ prefix: keyPrefix, key: qso.key }))
  }, [dispatch, entity, keyPrefix, entrySelections, yearQSOs, marathonMode, activeBand])

  const handleClearEntry = useCallback((qso) => {
    dispatch(setSelection({ prefix: keyPrefix, key: undefined }))
  }, [dispatch, keyPrefix])

  return (
    <Box sx={styles.root}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: 2, mb: 1 }}>
        <Box>
          Select a QSO for <b>{entity.entityPrefix}: {entity.name}</b> or
        </Box>
        <TextField
          id={`search-field-${entity.entityPrefix}`}
          value={search || ''}
          label='Search for a call sign'
          variant='standard'
          onChange={handleSearchChange}
          size='small'
        />
      </Box>

      {search?.length >= MINIMUM_SEARCH_LENGTH && qsos.length > 0 && (
        <Alert severity='warning' sx={{ maxWidth: '50rem', margin: 'auto', mt: 1, mb: 1 }}>
          You can select any call here, but it can still be considered invalid during scoring.<br />
          So please choose carefully.
        </Alert>
      )}

      {qsos.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th className='col-date'>Date</th>
              <th className='col-band'>Band</th>
              <th className='col-mode'>Mode</th>
              <th className='col-call'>Call</th>
              <th className='col-warnings'>Status</th>
              <th className='col-edit'>Action</th>
            </tr>
          </thead>
          <tbody>
            {qsos.map((qso, index) => {
              const isSelected = currentSelectionKey === qso.key
              const icons = []
              if (qso.isBadCall) icons.push({ type: 'bad', element: renderStatusIcon('bad') })
              if (qso.notes?.some(n => n.about === 'cqZone' || n.about === 'waeEntity' || n.about === 'entityPrefix' || n.about === 'duplicateQSO')) {
                icons.push({ type: 'warning', element: renderStatusIcon('warning') })
              }
              if (qso.isGoodCall) icons.push({ type: 'good', element: renderStatusIcon('good') })
              if (icons.length === 0 && qso.notes?.length > 0) {
                icons.push({ type: 'warning', element: renderStatusIcon('warning') })
              }

              const zIndexMap = { bad: 3, warning: 2, good: 1 }

              return (
                <tr
                  key={`${qso.key}-${index}`}
                  className={classNames(`band-${qso.band}`)}
                >
                  <td className='col-date'>
                    {fmtDateTime(qso.endOnMillis || qso.startAtMillis, DATE_FORMAT)}
                  </td>
                  <td className='col-band'>
                    {qso.band}
                  </td>
                  <td className='col-mode'>{qso.mode}</td>
                  <td className='col-call'>
                    <span className='callsign' style={{ verticalAlign: 'middle', display: 'inline-block' }}>
                      {qso.their.call}&nbsp;
                    </span>
                    {qso.notes && qso.notes.length > 0 && (
                      <Tooltip
                        arrow
                        title={
                          <Box>
                            {qso.notes.map((n, i) => renderTooltipNote(n, i))}
                          </Box>
                        }
                      >
                        <Box sx={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                          {icons.map((item, idx) => (
                            <Box key={idx} sx={{ ml: idx > 0 ? '-10px' : 0, zIndex: zIndexMap[item.type] || 0, position: 'relative' }}>
                              {item.element}
                            </Box>
                          ))}
                        </Box>
                      </Tooltip>
                    )}
                  </td>
                  <td className='col-warnings'>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                      {qso.qsl?.received ? (
                        <Chip
                          label='QSL'
                          color='info'
                          size='small'
                          icon={<CheckCircleRounded />}
                        />
                      ) : (
                        <Chip
                          label='qso'
                          color='warning'
                          size='small'
                          icon={<Error />}
                        />
                      )}
                      {warnings[qso.key] && (
                        <Box component="span" sx={{ fontSize: '0.875rem', ml: 0.5 }}>
                          {warnings[qso.key]}
                        </Box>
                      )}
                    </Box>
                  </td>
                  <td className='col-edit'>
                    {isSelected ? (
                      <Button size='small' color='error' onClick={() => handleClearEntry(qso)}>
                        Deselect
                      </Button>
                    ) : (
                      <Button size='small' color='primary' onClick={() => handleSelectEntry(qso)}>
                        Select
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <Box sx={{ textAlign: 'center', padding: '1rem', color: 'text.secondary' }}>
          No QSOs found
        </Box>
      )}
    </Box>
  )
}
