/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { selectMarathonMode } from '../../../store/settings'
import { CQWWEntities, CQZones } from '../../../../data/entities'
import { EntityEntry, DATE_FORMAT } from './EntityEntry'
import { ExcelEntry } from './ExcelEntry'
import { Typography, Tabs, Tab, Box, Button } from '@mui/material'
import { ThumbUp, ThumbDown, Feedback } from '@mui/icons-material'
import classNames from 'classnames'
import { fmtDateTime } from '@ham2k/lib-format-tools'
import { getSelectedEntry } from '../../../tools/getSelectedEntry'

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
  const marathonMode = useSelector(selectMarathonMode)

  React.useEffect(() => {
    setActiveTab(0)
  }, [marathonMode])

  const CHALLENGE_BANDS = useMemo(() => ['80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m'], [])

  const challengeBandCounts = useMemo(() => {
    const bandCounts = {}
    CHALLENGE_BANDS.forEach((band) => {
      bandCounts[band] = { entities: 0, zones: 0 }
    })

    CQWWEntities.forEach((entity) => {
      CHALLENGE_BANDS.forEach((band) => {
        const keyPrefix = `${entity.entityPrefix}-${band}`
        const key = entrySelections[keyPrefix]
        const qsosList = entityGroups[entity.entityPrefix] ?? []
        const prefixBandQSOs = qsosList.filter((q) => q.band === band)
        const entry = getSelectedEntry(prefixBandQSOs, key, entrySelections, keyPrefix, qsos)
        if (entry) {
          bandCounts[band].entities += 1
        }
      })
    })

    CQZones.forEach((zone) => {
      CHALLENGE_BANDS.forEach((band) => {
        const keyPrefix = `${zone.entityPrefix}-${band}`
        const key = entrySelections[keyPrefix]
        const qsosList = entityGroups[zone.entityPrefix] ?? []
        const prefixBandQSOs = qsosList.filter((q) => q.band === band)
        const entry = getSelectedEntry(prefixBandQSOs, key, entrySelections, keyPrefix, qsos)
        if (entry) {
          bandCounts[band].zones += 1
        }
      })
    })

    return bandCounts
  }, [entityGroups, entrySelections, CHALLENGE_BANDS, qsos])

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
      const entityQSOs = entityGroups[entity.entityPrefix] ?? []
      const entry = getSelectedEntry(entityQSOs, key, entrySelections, entity.entityPrefix, qsos)
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
      const zoneQSOs = entityGroups[zone.entityPrefix] ?? []
      const entry = getSelectedEntry(zoneQSOs, key, entrySelections, zone.entityPrefix, qsos)
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
  }, [entrySelections, entityGroups, qsos])

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

    if (marathonMode === 'challenge') {
      CHALLENGE_BANDS.forEach((band) => {
        CQWWEntities.forEach((entity) => {
          const keyPrefix = `${entity.entityPrefix}-${band}`
          const key = entrySelections[keyPrefix]
          const prefixBandQSOs = (entityGroups[entity.entityPrefix] ?? []).filter((q) => q.band === band)
          const entry = getSelectedEntry(prefixBandQSOs, key, entrySelections, keyPrefix, qsos)
          if (entry) addQSO(entry)
        })

        CQZones.forEach((zone) => {
          const keyPrefix = `${zone.entityPrefix}-${band}`
          const key = entrySelections[keyPrefix]
          const prefixBandQSOs = (entityGroups[zone.entityPrefix] ?? []).filter((q) => q.band === band)
          const entry = getSelectedEntry(prefixBandQSOs, key, entrySelections, keyPrefix, qsos)
          if (entry) addQSO(entry)
        })
      })
    } else {
      CQWWEntities.forEach((entity) => {
        const key = entrySelections[entity.entityPrefix]
        const prefixQSOs = entityGroups[entity.entityPrefix] ?? []
        const entry = getSelectedEntry(prefixQSOs, key, entrySelections, entity.entityPrefix, qsos)
        if (entry) addQSO(entry)
      })

      CQZones.forEach((zone) => {
        const key = entrySelections[zone.entityPrefix]
        const prefixQSOs = entityGroups[zone.entityPrefix] ?? []
        const entry = getSelectedEntry(prefixQSOs, key, entrySelections, zone.entityPrefix, qsos)
        if (entry) addQSO(entry)
      })
    }

    return Array.from(uniqueQSOs.values())
  }, [entrySelections, entityGroups, marathonMode, CHALLENGE_BANDS, qsos])

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
    const maxTabIdx = marathonMode === 'challenge' ? CHALLENGE_BANDS.length : 3
    if (activeTab === maxTabIdx && warningsCount === 0 && badCallsCount === 0) {
      setActiveTab(0)
    }
  }, [activeTab, warningsCount, badCallsCount, marathonMode, CHALLENGE_BANDS])

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
        {marathonMode === 'challenge' ? (
          <Tabs
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {CHALLENGE_BANDS.map((band, idx) => {
              const bandCount = challengeBandCounts[band] || { entities: 0, zones: 0 }
              const active = activeTab === idx
              return (
                <Tab
                  key={band}
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 0.5 }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1rem', textTransform: 'none', color: active ? 'inherit' : '#555' }}>
                        {band}
                      </span>
                      <span style={{ fontSize: '0.75rem', textTransform: 'none', marginTop: '2px', opacity: 0.8, color: active ? 'inherit' : '#777' }}>
                        {bandCount.entities} + {bandCount.zones}
                      </span>
                    </Box>
                  }
                />
              )
            })}
            {(warningsCount > 0 || badCallsCount > 0) && (
              <Tab label={warningsTabLabel} />
            )}
          </Tabs>
        ) : (
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
        )}
      </Box>

      {marathonMode === 'challenge' && activeTab < CHALLENGE_BANDS.length && (
        <>
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
              {CQWWEntities.map((entity, i) => {
                const activeBand = CHALLENGE_BANDS[activeTab]
                const keyPrefix = marathonMode === 'challenge' ? `${entity.entityPrefix}-${activeBand}` : entity.entityPrefix
                const qsosOnBand = (entityGroups[entity.entityPrefix] ?? []).filter(q => q.band === activeBand)
                return (
                  <EntityEntry
                    key={entity.entityPrefix}
                    entity={entity}
                    num={i}
                    qsos={qsosOnBand}
                    entryKey={entrySelections[keyPrefix]}
                    selectedPrefix={selectedPrefix}
                    setSelectedPrefix={setSelectedPrefix}
                    yearQSOs={qsos}
                    marathonMode={marathonMode}
                    activeBand={activeBand}
                  />
                )
              })}
            </tbody>
          </table>

          <Box sx={{ mt: 5 }} />

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
              {CQZones.map((zone, i) => {
                const activeBand = CHALLENGE_BANDS[activeTab]
                const keyPrefix = marathonMode === 'challenge' ? `${zone.entityPrefix}-${activeBand}` : zone.entityPrefix
                const qsosOnBand = (entityGroups[zone.entityPrefix] ?? []).filter(q => q.band === activeBand)
                return (
                  <EntityEntry
                    key={zone.entityPrefix}
                    entity={zone}
                    num={CQWWEntities.length + i}
                    qsos={qsosOnBand}
                    entryKey={entrySelections[keyPrefix]}
                    selectedPrefix={selectedPrefix}
                    setSelectedPrefix={setSelectedPrefix}
                    yearQSOs={qsos}
                    marathonMode={marathonMode}
                    activeBand={activeBand}
                  />
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {marathonMode !== 'challenge' && activeTab === 0 && (
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

      {marathonMode !== 'challenge' && activeTab === 1 && (
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

      {marathonMode !== 'challenge' && activeTab === 2 && (
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

      {marathonMode !== 'challenge' && activeTab === 3 && (
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

      {marathonMode === 'challenge' && activeTab === CHALLENGE_BANDS.length && (
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
