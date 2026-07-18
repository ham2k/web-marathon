import classNames from 'classnames'

import { fmtInteger, fmtDateTime } from '@ham2k/lib-format-tools'
import { Button, Chip, Tooltip, Typography } from '@mui/material'
import {
  CheckCircleRounded,
  Error,
  HearingDisabled,
  Edit,
  Clear,
  ThumbUp,
  ThumbDown,
  Feedback
} from '@mui/icons-material'
import { useDispatch } from 'react-redux'
import { setSelection } from '../../../store/entries'
import { Box } from '@mui/system'
import { EntitySelector } from './EntitySelector'

const styles = {
  root: {
    '&.odd td': {
      backgroundColor: '#F0F0F0'
    },
    '&.even td': {
      backgroundColor: '#FFF'
    }
  }
}

export const DATE_FORMAT = {
  hourCycle: 'h23',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: 'numeric',
  timeZone: 'UTC'
}

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

export function EntityEntry({
  entity,
  num,
  qsos,
  entryKey,
  selectedPrefix,
  setSelectedPrefix,
  yearQSOs
}) {
  const dispatch = useDispatch()

  const prefix = entity.entityPrefix

  let entry

  const handleToggleEntityEntry = event => {
    if (selectedPrefix === prefix) setSelectedPrefix('')
    else setSelectedPrefix(prefix)
  }

  if (entryKey === 'X') {
    entry = undefined
  } else if (entryKey) {
    entry = (qsos && qsos.find(q => q.key === entryKey)) || (qsos && qsos[0])
  } else {
    entry = qsos && qsos[0]
  }

  const cols = []
  cols.push(
    <td key='prefix' className='col-prefix callsign'>
      {prefix}
    </td>
  )
  cols.push(
    <td key='name' className='col-name'>
      {entity.flag || '🏳'}&nbsp;
      {entity.name}
    </td>
  )
  if (entry) {
    cols.push(
      <td key='date' className='col-date'>
        {fmtDateTime(entry.endOnMillis || entry.startAtMillis, DATE_FORMAT)}
      </td>
    )
    cols.push(
      <td key='band' className={classNames('col-band', 'band-color')}>
        {entry.band}
      </td>
    )
    cols.push(
      <td key='mode' className='col-mode'>
        {entry.mode}
      </td>
    )
    const icons = []
    if (entry.isBadCall) icons.push({ type: 'bad', element: renderStatusIcon('bad') })
    if (entry.notes?.some(n => n.about === 'cqZone' || n.about === 'waeEntity' || n.about === 'entityPrefix')) {
      icons.push({ type: 'warning', element: renderStatusIcon('warning') })
    }
    if (entry.isGoodCall) icons.push({ type: 'good', element: renderStatusIcon('good') })
    if (icons.length === 0 && entry.notes?.length > 0) {
      icons.push({ type: 'warning', element: renderStatusIcon('warning') })
    }

    const zIndexMap = { bad: 3, warning: 2, good: 1 }

    cols.push(
      <td key='call' className='col-call'>
        <span
          className='callsign'
          style={{ verticalAlign: 'middle', display: 'inline-block' }}
        >
          {entry.their.call}&nbsp;
        </span>
        {entry.notes && entry.notes.length > 0 && (
          <Tooltip
            arrow
            title={
              <Box>
                {entry.notes.map((n, i) => renderTooltipNote(n, i))}
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
    )
    cols.push(
      <td key='qsl-active' className='col-qsl'>
        {entry?.qsl?.received
          ? (
            <Chip
              label='QSL'
              color='info'
              size='small'
              icon={<CheckCircleRounded entry={entry} />}
            />
          )
          : (
            <Chip label='qso' color='warning' size='small' icon={<Error />} />
          )}
      </td>
    )
    cols.push(
      <td key='edit-active' className='col-edit' style={{ textAlign: 'center' }}>
        {prefix && selectedPrefix === prefix ? (
          <Button size='small' color='error' onClick={handleToggleEntityEntry} startIcon={<Clear />}>
            DONE
          </Button>
        ) : (
          <Button size='small' color='primary' onClick={handleToggleEntityEntry}>
            <Edit fontSize='small' />
            {qsos && qsos.length > 1 ? `+${fmtInteger(qsos.length - 1)}` : ''}
          </Button>
        )}
      </td>
    )
  } else {
    cols.push(
      <td key='call' colSpan='4' style={{ textAlign: 'center', color: '#888' }}>
        -
      </td>
    )
    cols.push(
      <td key='qsl-inactive'>
        <Chip
          label='nil'
          color='default'
          size='small'
          icon={<HearingDisabled />}
        />
      </td>
    )
    cols.push(
      <td key='edit-inactive' className='col-edit' style={{ textAlign: 'center' }}>
        {prefix && selectedPrefix === prefix ? (
          <Button size='small' color='error' onClick={handleToggleEntityEntry} startIcon={<Clear />}>
            DONE
          </Button>
        ) : (
          <Button size='small' color='primary' onClick={handleToggleEntityEntry}>
            <Edit fontSize='small' />
            {qsos && qsos.length > 1 ? `+${fmtInteger(qsos.length - 1)}` : ''}
          </Button>
        )}
      </td>
    )
  }

  return (
    <>
      <Box
        component='tr'
        sx={styles.root}
        className={classNames(
          prefix && selectedPrefix === prefix && 'selected',
          num % 2 === 0 ? 'even' : 'odd',
          `band-${entry?.band || 'none'}`
        )}
      >
        {cols}
      </Box>
      {prefix && selectedPrefix === prefix && (
        <Box
          component='tr'
          sx={styles.root}
          className={classNames(
            'selected',
            num % 2 === 0 ? 'even' : 'odd'
          )}
        >
          <td colSpan={8}>
            <EntitySelector
              entity={entity}
              qsos={qsos}
              yearQSOs={yearQSOs}
              setSelectedPrefix={setSelectedPrefix}
            />
          </td>
        </Box>
      )}
    </>
  )
}
