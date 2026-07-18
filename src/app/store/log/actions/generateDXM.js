import { fmtDateTimeISO } from '@ham2k/lib-format-tools'
import { create } from 'xmlbuilder2'

import { CQWWEntities, CQZones } from '../../../../data/entities'
import WAE_CODES from '../../../../data/wae-codes.json'
import { getSelectedEntry } from '../../../tools/getSelectedEntry'

import { selectSettings, selectMarathonMode } from '../../settings'
import { selectEntrySelections, selectOurCalls } from '../../entries'
import { selectEntityGroups, selectYearQSOs } from '../logSlice'

export const generateDXM = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const state = getState()
      const settings = selectSettings(state)
      const marathonMode = selectMarathonMode(state)

      const ourCalls = selectOurCalls(state)
      let call = Object.keys(ourCalls)[0] || ''
      if (marathonMode === 'challenge' && call) {
        call = `${call}-challenge`
      }
      const altCall = Object.keys(ourCalls).filter(c => c !== call).join(',')

      const entityGroups = selectEntityGroups(state)
      const entrySelections = selectEntrySelections(state)
      const yearQSOs = selectYearQSOs(state)

      const adx = buildADX({ entryInfo: { call, altCall }, entityGroups, entrySelections, settings, marathonMode, yearQSOs })

      resolve(adx.end({ prettyPrint: true }))
    })
  }
}

function buildADX({ entryInfo, entrySelections, entityGroups, settings, marathonMode, yearQSOs }) {
  const dxm = create({ version: '1.0', encoding: 'utf-8' })
    .ele('DXMARATHON', { year: settings.year, generated_on: fmtDateTimeISO(new Date()), generated_by: 'Ham2K Marathon Tools' })

  dxm.ele('ENTRY')
    .ele('CALL').txt(entryInfo.call).up()
    .ele('ALT_CALL').txt(entryInfo.altCall).up()
    .ele('SOAPBOX').txt('Submission generated with the help of Ham2K Marathon Tools!').up()

  const entities = dxm.ele('ENTITIES')

  const appendEntityQSO = (selected, entity) => {
    if (!selected) return
    const qso = entities.ele('QSO')
      .ele('CALL').txt(selected.their.call).up()
      .ele('OUR_CALL').txt(selected.our.call).up()
      .ele('TIME').txt(fmtDateTimeISO(selected.startAtMillis)).up()
      .ele('BAND').txt(selected.band).up()
      .ele('MODE').txt(simplifyMode(selected.mode)).up()
      .ele('PREFIX').txt(entity.entityPrefix).up()
      .ele('COUNTRY').txt(entity.name).up()
      .ele('DXCC').txt(WAE_CODES[entity.entityPrefix] || entity.dxccCode).up()

    selected.qsl?.received && Object.keys(selected.qsl).forEach(source => {
      if (source !== 'received') qso.ele('QSL', { via: source })
    })
  }

  const zones = dxm.ele('ZONES')

  const appendZoneQSO = (selected, zone) => {
    if (!selected) return
    const qso = zones.ele('QSO')
      .ele('CALL').txt(selected.their.call).up()
      .ele('OUR_CALL').txt(selected.our.call).up()
      .ele('TIME').txt(fmtDateTimeISO(selected.startAtMillis)).up()
      .ele('BAND').txt(selected.band).up()
      .ele('MODE').txt(simplifyMode(selected.mode)).up()
      .ele('CQZ').txt(zone.zone).up()

    selected?.qsl?.received && Object.keys(selected.qsl).forEach(source => {
      if (source !== 'received') qso.ele('QSL', { via: source })
    })
  }

  if (marathonMode === 'challenge') {
    const CHALLENGE_BANDS = ['80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m']
    CHALLENGE_BANDS.forEach((band) => {
      CQWWEntities.forEach((entity) => {
        const keyPrefix = `${entity.entityPrefix}-${band}`
        const key = entrySelections[keyPrefix]
        const entityQSOs = (entityGroups[entity.entityPrefix] ?? []).filter((q) => q.band === band)
        const selected = getSelectedEntry(entityQSOs, key, entrySelections, keyPrefix, yearQSOs)
        appendEntityQSO(selected, entity)
      })

      CQZones.forEach((zone) => {
        const keyPrefix = `${zone.entityPrefix}-${band}`
        const key = entrySelections[keyPrefix]
        const zoneQSOs = (entityGroups[zone.entityPrefix] ?? []).filter((q) => q.band === band)
        const selected = getSelectedEntry(zoneQSOs, key, entrySelections, keyPrefix, yearQSOs)
        appendZoneQSO(selected, zone)
      })
    })
  } else {
    CQWWEntities.forEach((entity) => {
      const key = entrySelections[entity.entityPrefix]
      const entityQSOs = entityGroups[entity.entityPrefix] ?? []
      const selected = getSelectedEntry(entityQSOs, key, entrySelections, entity.entityPrefix, yearQSOs)
      appendEntityQSO(selected, entity)
    })

    CQZones.forEach((zone) => {
      const key = entrySelections[zone.entityPrefix]
      const zoneQSOs = entityGroups[zone.entityPrefix] ?? []
      const selected = getSelectedEntry(zoneQSOs, key, entrySelections, zone.entityPrefix, yearQSOs)
      appendZoneQSO(selected, zone)
    })
  }

  return dxm
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

export default function simplifyMode(mode) {
  mode = mode.toUpperCase()
  return SIMPLIFIED_MODES[mode] || 'DIGITAL'
}
