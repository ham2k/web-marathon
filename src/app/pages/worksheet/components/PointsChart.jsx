import React from 'react'
import { useSelector } from 'react-redux'

import { EntitiesAndZones, CQWWEntities, CQZones } from '../../../../data/entities'
import { selectMarathonMode } from '../../../store/settings'
import { dateFormatterGenerator } from '@ham2k/lib-format-tools'
import { getSelectedEntry } from '../../../tools/getSelectedEntry'
import guessCurrentYear from '../../../tools/guessCurrentYear'
import { Box, Typography } from '@mui/material'

const ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000

const ONE_WEEK_IN_MILLIS = 7 * ONE_DAY_IN_MILLIS

const fmtDateDayMonthZulu = dateFormatterGenerator('dayMonth', { timeZone: 'UTC' })

export function PointsChart ({ qsos, entityGroups, entrySelections, settings }) {
  const [hoveredBin, setHoveredBin] = React.useState(null)
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 })
  const containerRef = React.useRef(null)
  const [width, setWidth] = React.useState(800)

  React.useEffect(() => {
    if (!containerRef.current) return
    if (typeof ResizeObserver === 'undefined') return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) {
          setWidth(entry.contentRect.width)
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const marathonMode = useSelector(selectMarathonMode)
  const { entityEntries, zoneEntries } = React.useMemo(() => {
    const zoneEntries = []
    const entityEntries = []

    if (marathonMode === 'challenge') {
      const CHALLENGE_BANDS = ['80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m']
      // Pre-group by prefix and band to prevent filter inside the nested loops
      const entityGroupsByPrefixAndBand = {}
      if (entityGroups) {
        Object.keys(entityGroups).forEach((prefix) => {
          const list = entityGroups[prefix] ?? []
          list.forEach((qso) => {
            const key = `${prefix}-${qso.band}`
            entityGroupsByPrefixAndBand[key] = entityGroupsByPrefixAndBand[key] ?? []
            entityGroupsByPrefixAndBand[key].push(qso)
          })
        })
      }

      CHALLENGE_BANDS.forEach((band) => {
        CQWWEntities.forEach((entity) => {
          const keyPrefix = `${entity.entityPrefix}-${band}`
          const key = entrySelections[keyPrefix]
          const entityQSOs = entityGroupsByPrefixAndBand[`${entity.entityPrefix}-${band}`] ?? []
          const entry = getSelectedEntry(entityQSOs, key, undefined, undefined, qsos)
          if (entry) {
            entityEntries.push(entry)
          }
        })

        CQZones.forEach((zone) => {
          const keyPrefix = `${zone.entityPrefix}-${band}`
          const key = entrySelections[keyPrefix]
          const zoneQSOs = entityGroupsByPrefixAndBand[`${zone.entityPrefix}-${band}`] ?? []
          const entry = getSelectedEntry(zoneQSOs, key, undefined, undefined, qsos)
          if (entry) {
            zoneEntries.push(entry)
          }
        })
      })
    } else {
      EntitiesAndZones.forEach((entity) => {
        const key = entrySelections[entity.entityPrefix]
        const entityQSOs = entityGroups[entity.entityPrefix] ?? []
        const entry = getSelectedEntry(entityQSOs, key, undefined, undefined, qsos)
        if (entry) {
          if (entity.zone) zoneEntries.push(entry)
          else entityEntries.push(entry)
        }
      })
    }

    return { entityEntries, zoneEntries }
  }, [entrySelections, entityGroups, qsos, marathonMode])

  const year = settings?.year ?? guessCurrentYear()
  const yearStart = new Date(`${year}-01-01T00:00:00Z`).valueOf()
  const yearEnd = new Date(`${year}-12-31T23:59:59Z`).valueOf()

  const { bins, maxTotVal } = React.useMemo(() => {
    const bins = []
    let weekStart = yearStart
    let weekEnd

    const entityPusher = (bin) => (entry) => {
      if (entry.startAtMillis <= weekEnd && entry.endAtMillis >= weekStart) {
        bin.entities.push(entry)
      }
    }
    const zonePusher = (bin) => (entry) => {
      if (entry.startAtMillis <= weekEnd && entry.endAtMillis >= weekStart) {
        bin.zones.push(entry)
      }
    }

    while (weekStart <= yearEnd) {
      weekEnd = weekStart + ONE_WEEK_IN_MILLIS

      const bin = { entities: [], zones: [], startAtMillis: weekStart, endAtMillis: weekEnd }
      entityEntries.forEach(entityPusher(bin))
      zoneEntries.forEach(zonePusher(bin))
      bins.push(bin)
      weekStart = weekEnd
    }

    const maxTotVal = Math.max(...bins.map((bin) => bin.entities.length + bin.zones.length))
    return { bins, maxTotVal }
  }, [entityEntries, zoneEntries, yearStart, yearEnd])
  const scaleH = 120 / Math.sqrt(maxTotVal || 1)

  const paddingLeft = 50
  const paddingRight = 20
  const plotWidth = Math.max(200, width - paddingLeft - paddingRight)

  // Give enough padding to keep bars to the right of the vertical axis
  const tempStep = plotWidth / (bins.length - 1)
  const maxBarWidth = Math.max(4, tempStep - 5)
  const barMargin = maxBarWidth / 2 + 5

  const activePlotWidth = plotWidth - 2 * barMargin
  const step = activePlotWidth / (bins.length - 1)
  const scaleW = maxBarWidth / Math.sqrt(maxTotVal || 1)

  // Title aligns exactly with the left edge of the canvas
  const labelX = 0

  const gridVals = [5, 10, 50, 100].filter((v) => v <= maxTotVal)

  const now = Date.now()
  let futureX = null
  if (now >= yearStart && now <= yearEnd) {
    const proportion = (now - yearStart) / (yearEnd - yearStart)
    futureX = paddingLeft + barMargin + proportion * activePlotWidth
  } else if (now < yearStart) {
    futureX = paddingLeft + barMargin
  }

  const handleMouseMove = (event, bin) => {
    setHoveredBin(bin)
    setTooltipPos({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredBin(null)
  }

  return (
    <Box sx={{ mb: 3, position: 'relative' }}>
      <Box
        ref={containerRef}
        sx={{ overflowX: 'auto', width: '100%' }}
      >
        <svg viewBox={`0 0 ${width} 200`} width="100%" height="200" style={{ display: 'block' }}>
          {/* Chart Label/Watermark inside the chart area */}
          <text
            x={labelX}
            y={28}
            textAnchor="start"
            style={{
              fontFamily: 'sans-serif',
              pointerEvents: 'none'
            }}
          >
            <tspan style={{ fontSize: '13px', fontWeight: 600, fill: '#000' }}>
              New points per week
            </tspan>
            <tspan style={{ fontSize: '11px', fill: '#666', fontWeight: 400 }} dx="8">
              (Area represents total points)
            </tspan>
          </text>


          {/* Grid lines & Y-Axis labels */}
          {gridVals.map((val) => {
            const y = 160 - Math.sqrt(val) * scaleH
            return (
              <React.Fragment key={val}>
                <line x1={0} y1={y} x2={width} y2={y} stroke="#e5e5e5" strokeDasharray="3,3" />
                <text
                  x={0}
                  y={y + 12}
                  textAnchor="start"
                  style={{ fontSize: '10px', fill: '#888', fontFamily: 'sans-serif' }}
                >
                  {val}
                </text>
              </React.Fragment>
            )
          })}

          {futureX !== null && (
            <>
              {/* Shaded future background */}
              <rect
                x={futureX}
                y={10}
                width={width - futureX}
                height={150}
                fill="rgba(0, 0, 0, 0.025)"
                pointerEvents="none"
              />
              {/* "Today" vertical dashed line */}
              <line
                x1={futureX}
                y1={10}
                x2={futureX}
                y2={160}
                stroke="#ccc"
                strokeDasharray="4,4"
                pointerEvents="none"
              />
            </>
          )}

          {/* Render bars */}
          {bins.map((bin, i) => {
            const x = paddingLeft + barMargin + i * step
            const cEnt = bin.entities.length
            const cZone = bin.zones.length
            const cTot = cEnt + cZone

            if (cTot === 0) return null

            const w = Math.sqrt(cTot) * scaleW
            const h = Math.sqrt(cTot) * scaleH

            const hEnt = h * (cEnt / cTot)
            const hZone = h * (cZone / cTot)

            return (
              <g key={i}>
                {/* Entities (yellow/orange) at bottom */}
                {cEnt > 0 && (
                  <rect
                    x={x - w / 2}
                    y={160 - hEnt}
                    width={w}
                    height={hEnt}
                    fill="#ff9800"
                    fillOpacity={0.85}
                  />
                )}
                {/* Zones (blue) stacked on top */}
                {cZone > 0 && (
                  <rect
                    x={x - w / 2}
                    y={160 - h}
                    width={w}
                    height={hZone}
                    fill="#0288d1"
                    fillOpacity={0.85}
                  />
                )}

                {/* Transparent hit-test trigger area for hover tooltips */}
                <rect
                  x={x - step / 2}
                  y={10}
                  width={step}
                  height={150}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseMove={(e) => handleMouseMove(e, bin)}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            )
          })}

          {/* X-Axis labels */}
          {bins.map((bin, i) => {
            if (i % 7 === 0 || i === bins.length - 1) {
              const x = paddingLeft + barMargin + i * step
              return (
                <text
                  key={i}
                  x={x}
                  y={180}
                  textAnchor="middle"
                  style={{ fontSize: '10px', fill: '#888', fontFamily: 'sans-serif' }}
                >
                  {fmtDateDayMonthZulu(bin.startAtMillis)}
                </text>
              )
            }
            return null
          })}

          {/* Baseline */}
          <line x1={0} y1={160} x2={width} y2={160} stroke="#ccc" strokeWidth={1} />
          
          {/* Top border */}
          <line x1={0} y1={10} x2={width} y2={10} stroke="#ccc" strokeWidth={1} />
        </svg>
      </Box>

      {/* Custom Tooltip */}
      {hoveredBin && (
        <Box
          sx={{
            position: 'fixed',
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 15,
            bgcolor: 'rgba(30, 30, 30, 0.95)',
            color: '#fff',
            p: 1.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '1px solid #555'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {fmtDateDayMonthZulu(hoveredBin.startAtMillis)} to {fmtDateDayMonthZulu(hoveredBin.endAtMillis - ONE_DAY_IN_MILLIS)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff9800' }} />
            <span>Entities: <strong>{hoveredBin.entities.length}</strong> Points</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0288d1' }} />
            <span>Zones: <strong>{hoveredBin.zones.length}</strong> Points</span>
          </div>
        </Box>
      )}
    </Box>
  )
}
