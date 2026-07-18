/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from 'react'

import { CQWWEntities, CQZones } from '../../../../data/entities'
import { EntityEntry, DATE_FORMAT } from './EntityEntry'
import { ExcelEntry } from './ExcelEntry'
import { Typography, Tabs, Tab, Box, Button } from '@mui/material'
import { ThumbUp, ThumbDown, Feedback } from '@mui/icons-material'
import classNames from 'classnames'
import { fmtDateTime } from '@ham2k/lib-format-tools'

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

const styles = {
  root: {
    '& .table': {
      width: 'inherit important!',
      minWidth: '100%',
      marginTop: '0.5em',
      '& th': {
        textAlign: 'left',
        paddingRight: '1em'
      },
      '& td': {
        textAlign: 'left',
        paddingRight: '1em'
      },

      '& .col-prefix': {
        textAlign: 'center',
        maxWidth: '4em',
        whiteSpace: 'nowrap'
      },
      '& .col-name': {
        minWidth: '5.5em'
      },
      '& .col-time': {
        minWidth: '5.5em'
      },
      '& .col-band': {
        textAlign: 'right'
      },
      '& .col-call': {
        fontWeight: 'bold'
      },
      '& .col-freq': {
        textAlign: 'right'
      },
      '& .col-cqz, & .col-ituz, & .col-exch-cqZone, & .col-exch-ituZone': {
        textAlign: 'right'
      }
    }
  }
}

export function EntityList ({ qsos, entityGroups, entrySelections }) {
  const [selectedPrefix, setSelectedPrefix] = useState('')
  const [activeTab, setActiveTab] = useState(0)

  const waeEntities = useMemo(() => {
    return CQWWEntities.filter((entity) => entity.entityPrefix.startsWith('*'))
  }, [])

  const counts = useMemo(() => {
    const memoCounts = {
      entities: { qso: 0, qsl: 0, nil: 0 },
      zones: { qso: 0, qsl: 0, nil: 0 },
      wae: { qso: 0, qsl: 0, nil: 0 }
    }

    CQWWEntities.forEach((entity) => {
      const key = entrySelections[entity.entityPrefix]
      const qsos = entityGroups[entity.entityPrefix] ?? []
      const entry = key === 'X' ? undefined : ((key && qsos.find((qso) => qso.key === key)) ?? qsos[0])
      const isWae = entity.entityPrefix.startsWith('*')

      if (entry) {
        if (entry.qsl?.received > 0) {
          memoCounts.entities.qsl += 1
          if (isWae) memoCounts.wae.qsl += 1
        } else {
          memoCounts.entities.qso += 1
          if (isWae) memoCounts.wae.qso += 1
        }
      } else {
        memoCounts.entities.nil += 1
        if (isWae) memoCounts.wae.nil += 1
      }
    })

    CQZones.forEach((zone) => {
      const key = entrySelections[zone.entityPrefix]
      const qsos = entityGroups[zone.entityPrefix] ?? []
      const entry = key === 'X' ? undefined : (qsos.find((qso) => qso.key === key) ?? qsos[0])
      if (entry) {
        if (entry.qsl?.received > 0) {
          memoCounts.zones.qsl += 1
        } else {
          memoCounts.zones.qso += 1
        }
      } else {
        memoCounts.zones.nil += 1
      }
    })

    return memoCounts
  }, [entrySelections, entityGroups])

  const totalClaimedEntities = counts.entities.qsl + counts.entities.qso
  const totalClaimedZones = counts.zones.qsl + counts.zones.qso
  const totalClaimedWae = counts.wae.qsl + counts.wae.qso

  const claimedQSOs = useMemo(() => {
    const uniqueQSOs = new Map()

    const addQSO = (qso) => {
      if (qso && qso.key) {
        uniqueQSOs.set(qso.key, qso)
      }
    }

    CQWWEntities.forEach((entity) => {
      const key = entrySelections[entity.entityPrefix]
      const prefixQSOs = entityGroups[entity.entityPrefix] ?? []
      if (key === 'X') return
      const entry = (key && prefixQSOs.find((q) => q.key === key)) ?? prefixQSOs[0]
      if (entry) addQSO(entry)
    })

    CQZones.forEach((zone) => {
      const key = entrySelections[zone.entityPrefix]
      const prefixQSOs = entityGroups[zone.entityPrefix] ?? []
      if (key === 'X') return
      const entry = (key && prefixQSOs.find((q) => q.key === key)) ?? prefixQSOs[0]
      if (entry) addQSO(entry)
    })

    return Array.from(uniqueQSOs.values())
  }, [entrySelections, entityGroups])

  const { warningsCount, badCallsCount } = useMemo(() => {
    let warnings = 0
    let badCalls = 0

    claimedQSOs.forEach(q => {
      if (q.isBadCall) {
        badCalls++
      }
      const wNotes = (q.notes ?? []).filter(n => n.about !== 'goodCall' && n.about !== 'badCall')
      warnings += wNotes.length
    })

    return { warningsCount: warnings, badCallsCount: badCalls }
  }, [claimedQSOs])

  const warningsTabLabel = useMemo(() => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {warningsCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {renderStatusIcon('warning', true)}
            <span>{warningsCount} warning{warningsCount !== 1 ? 's' : ''}</span>
          </Box>
        )}
        {warningsCount > 0 && badCallsCount > 0 && <span>{"\u00a0\u00a0"}</span>}
        {badCallsCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {renderStatusIcon('bad', true)}
            <span>{badCallsCount} bad call{badCallsCount !== 1 ? 's' : ''}</span>
          </Box>
        )}
      </Box>
    )
  }, [warningsCount, badCallsCount])

  React.useEffect(() => {
    if (activeTab === 3 && warningsCount === 0 && badCallsCount === 0) {
      setActiveTab(0)
    }
  }, [activeTab, warningsCount, badCallsCount])

  return (
    <Box sx={styles.root}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: -100,
          height: 1,
          width: 1,
          opacity: 0,
          overflow: 'hidden'
        }}
      >
        <table id='excel-table'>
          <tbody>
            {CQWWEntities.map((entity, i) => (
              <ExcelEntry
                key={entity.entityPrefix}
                qsos={entityGroups[entity.entityPrefix]}
                entryKey={entrySelections[entity.entityPrefix]}
              />
            ))}
            {CQZones.map((zone, i) => (
              <ExcelEntry
                key={zone.entityPrefix}
                qsos={entityGroups[zone.entityPrefix]}
                entryKey={entrySelections[zone.entityPrefix]}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Box sx={{ borderBottom: '1px solid #ccc', mt: 3, mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label={`${totalClaimedEntities} ENTITIES`} />
          <Tab label={`${totalClaimedZones} ZONES`} />
          <Tab label="*WAE" />
          {(warningsCount > 0 || badCallsCount > 0) && (
            <Tab label={warningsTabLabel} />
          )}
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <table className='table nice-table band-colors'>
          <thead>
            <tr>
              <th className='col-prefix'>Prefix</th>
              <th className='col-name'>Name</th>
              <th className='col-date'>Date</th>
              <th className='col-band'>Band</th>
              <th className='col-mode'>Mode</th>
              <th className='col-call'>Call</th>
              <th className='col-qsl'>QSL</th>
              <th className='col-edit' style={{ textAlign: 'center' }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {CQWWEntities.map((entity, i) => (
              <EntityEntry
                key={entity.entityPrefix}
                entity={entity}
                num={i}
                qsos={entityGroups[entity.entityPrefix]}
                entryKey={entrySelections[entity.entityPrefix]}
                selectedPrefix={selectedPrefix}
                setSelectedPrefix={setSelectedPrefix}
                yearQSOs={qsos}
              />
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 1 && (
        <table className='table nice-table band-colors'>
          <thead>
            <tr>
              <th className='col-prefix'>Prefix</th>
              <th className='col-name'>Name</th>
              <th className='col-date'>Date</th>
              <th className='col-band'>Band</th>
              <th className='col-mode'>Mode</th>
              <th className='col-call'>Call</th>
              <th className='col-qsl'>QSL</th>
              <th className='col-edit' style={{ textAlign: 'center' }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {CQZones.map((zone, i) => (
              <EntityEntry
                key={zone.entityPrefix}
                entity={zone}
                num={i}
                qsos={entityGroups[zone.entityPrefix]}
                entryKey={entrySelections[zone.entityPrefix]}
                selectedPrefix={selectedPrefix}
                setSelectedPrefix={setSelectedPrefix}
                yearQSOs={qsos}
              />
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 2 && (
        <table className='table nice-table band-colors'>
          <thead>
            <tr>
              <th className='col-prefix'>Prefix</th>
              <th className='col-name'>Name</th>
              <th className='col-date'>Date</th>
              <th className='col-band'>Band</th>
              <th className='col-mode'>Mode</th>
              <th className='col-call'>Call</th>
              <th className='col-qsl'>QSL</th>
              <th className='col-edit' style={{ textAlign: 'center' }}>Edit</th>
            </tr>
          </thead>
          <tbody>
            {waeEntities.map((entity, i) => (
              <EntityEntry
                key={entity.entityPrefix}
                entity={entity}
                num={i}
                qsos={entityGroups[entity.entityPrefix]}
                entryKey={entrySelections[entity.entityPrefix]}
                selectedPrefix={selectedPrefix}
                setSelectedPrefix={setSelectedPrefix}
                yearQSOs={qsos}
              />
            ))}
          </tbody>
        </table>
      )}

      {activeTab === 3 && (
        <table className='table nice-table band-colors'>
          <thead>
            <tr>
              <th className='col-prefix'>Prefix</th>
              <th className='col-name'>Name</th>
              <th className='col-date'>Date</th>
              <th className='col-band'>Band</th>
              <th className='col-mode'>Mode</th>
              <th className='col-call'>Call</th>
              <th className='col-status' style={{ textAlign: 'center' }}>Status</th>
              <th className='col-message'>Message</th>
            </tr>
          </thead>
          <tbody>
            {claimedQSOs
              .filter(qso => qso.isBadCall || qso.notes?.some(n => n.about !== 'goodCall' && n.about !== 'badCall'))
              .map((qso) => {
                const prefix = qso.their.entityPrefix
                const entity = CQWWEntities.find(e => e.entityPrefix === prefix) || CQZones.find(z => z.entityPrefix === prefix)
                const entityName = entity ? entity.name : qso.their.entityName || ''
                const flag = entity ? entity.flag : '🏳'
                const displayNotes = (qso.notes ?? []).filter(n => n.about !== 'goodCall')

                const icons = []
                if (qso.isBadCall) icons.push({ type: 'bad', element: renderStatusIcon('bad') })
                if (qso.notes?.some(n => n.about === 'cqZone' || n.about === 'waeEntity' || n.about === 'entityPrefix')) {
                  icons.push({ type: 'warning', element: renderStatusIcon('warning') })
                }
                const zIndexMap = { bad: 3, warning: 2, good: 1 }

                return (
                  <tr key={qso.key} className={classNames(`band-${qso.band}`)}>
                    <td className='col-prefix'>{prefix}</td>
                    <td className='col-name'>{flag}&nbsp;{entityName}</td>
                    <td className='col-date'>{fmtDateTime(qso.endOnMillis || qso.startAtMillis, DATE_FORMAT)}</td>
                    <td className='col-band'>{qso.band}</td>
                    <td className='col-mode'>{qso.mode}</td>
                    <td className='col-call'>{qso.their.call}</td>
                    <td className='col-status' style={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                        {icons.map((item, idx) => (
                          <Box key={idx} sx={{ ml: idx > 0 ? '-10px' : 0, zIndex: zIndexMap[item.type] || 0, position: 'relative' }}>
                            {item.element}
                          </Box>
                        ))}
                      </Box>
                    </td>
                    <td className='col-message' style={{ fontSize: '0.85rem', whiteSpace: 'pre-line' }}>
                      {displayNotes.map((n, i) => (
                        <div key={i} style={{ margin: '2px 0' }}>{n.note}</div>
                      ))}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      )}
    </Box>
  )
}
