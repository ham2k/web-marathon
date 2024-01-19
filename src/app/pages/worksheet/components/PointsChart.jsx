import React from 'react'

import ApexChart from 'react-apexcharts'
import { EntitiesAndZones } from '../../../../data/entities'

import { Typography } from '@mui/material'
import { dateFormatterGenerator } from '@ham2k/lib-format-tools'
import guessCurrentYear from '../../../tools/guessCurrentYear'

const ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000

const ONE_WEEK_IN_MILLIS = 7 * ONE_DAY_IN_MILLIS

const fmtDateDayMonthZulu = dateFormatterGenerator('dayMonth', { timeZone: 'UTC' })

export function PointsChart ({ qsos, entityGroups, entrySelections, settings }) {
  const height = 200

  const zoneEntries = []
  const entityEntries = []

  EntitiesAndZones.forEach((entity) => {
    const key = entrySelections[entity.entityPrefix]
    const qsos = entityGroups[entity.entityPrefix] ?? []
    const entry = (key && qsos.find((qso) => qso.key === key)) ?? qsos[0]
    if (entry) {
      if (entity.zone) zoneEntries.push(entry)
      else entityEntries.push(entry)
    }
  })

  const year = settings?.year ?? guessCurrentYear()
  const yearStart = new Date(`${year}-01-01T00:00:00Z`).valueOf()
  const yearEnd = new Date(`${year}-12-31T23:59:59Z`).valueOf()

  const bins = []
  let weekStart = yearStart
  let weekEnd

  // We need to define these functions out here, instead of inline, to avoid scope problems
  // See https://eslint.org/docs/latest/rules/no-loop-func
  const entityPusher = (bin) => (entry) => {
    if (entry.startOnMillis <= weekEnd && entry.endOnMillis >= weekStart) {
      bin.entities.push(entry)
    }
  }
  const zonePusher = (bin) => (entry) => {
    if (entry.startOnMillis <= weekEnd && entry.endOnMillis >= weekStart) {
      bin.zones.push(entry)
    }
  }

  // debugger
  while (weekStart <= yearEnd) {
    weekEnd = weekStart + ONE_WEEK_IN_MILLIS

    const bin = { entities: [], zones: [], startOnMillis: weekStart, endOnMillis: weekEnd }
    entityEntries.forEach(entityPusher(bin))
    zoneEntries.forEach(zonePusher(bin))
    bins.push(bin)
    weekStart = weekEnd
  }

  const maxPoints = Math.max(...bins.map((bin) => bin.entities.length + bin.zones.length))

  const series = [
    {
      type: 'column',
      name: 'Entities',
      data: bins.map((bin, i) => ({ x: bin.startOnMillis, y: bin.entities.length ?? null, bin }))
    },
    {
      type: 'column',
      name: 'Zones',
      data: bins.map((bin, i) => ({ x: bin.startOnMillis, y: bin.zones.length ?? null, bin }))
    }
  ]

  const options = {
    chart: {
      type: 'line',
      height,
      stacked: true,
      toolbar: {
        show: false
        // tools: {
        //   download: false,
        //   selection: false,
        //   zoom: true,
        //   zoomin: true,
        //   zoomout: true,
        //   pan: true,
        //   reset: true,
        // },
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      width: [0, 0],
      curve: ['straight', 'straight']
    },
    fill: {
      opacity: [1, 1]
    },
    colors: ['#ff9800', '#0288d1'],
    responsive: [
      {
        breakpoint: 800,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }
    ],
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0
      }
    },
    tooltip: {
      enabled: true,
      // shared: true,
      // intersect: false,
      followCursor: false,
      x: {
        formatter: (x) =>
          `${fmtDateDayMonthZulu(x)} to ${fmtDateDayMonthZulu(x + ONE_WEEK_IN_MILLIS - ONE_DAY_IN_MILLIS)}`
      },
      y: {
        formatter: (y) => `${y} Points`
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: (x) => fmtDateDayMonthZulu(x)
      }
    },
    yaxis: [
      {
        seriesName: 'Entities',
        show: true,
        forceNiceScale: true,
        min: 0,
        max: maxPoints
      },
      { seriesName: 'Zones', show: false, min: 0, max: maxPoints }
    ],
    legend: {
      position: 'right',
      offsetY: 40,
      showForNullSeries: false,
      inverseOrder: true
    }
  }

  return (
    <div>
      <Typography component='h2' variant='h5'>
        <b>{entityEntries.length + zoneEntries.length} total points:&nbsp;</b>
        <a href='worksheet#entities'>{entityEntries.length} Entities</a>&nbsp;+&nbsp;
        <a href='worksheet#zones'>{zoneEntries.length} Zones</a>
      </Typography>

      <ApexChart options={options} series={series} type='bar' height={height} />
    </div>
  )
}
