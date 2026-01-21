import { fmtDateTimeISO } from '@ham2k/lib-format-tools'
import { create } from 'xmlbuilder2'

import { CQWWEntities, CQZones } from '../../../../data/entities'
import WAE_CODES from '../../../../data/wae-codes.json'

import { selectSettings } from '../../settings'
import { selectEntrySelections, selectOurCalls } from '../../entries'
import { selectEntityGroups } from '../logSlice'

export const generateDXM = () => {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      const state = getState()
      const settings = selectSettings(state)

      const ourCalls = selectOurCalls(state)
      const call = Object.keys(ourCalls)[0] || ''
      const altCall = Object.keys(ourCalls).filter(c => c !== call).join(',')

      const entityGroups = selectEntityGroups(state)
      const entrySelections = selectEntrySelections(state)

      const adx = buildADX({ entryInfo: { call, altCall }, entityGroups, entrySelections, settings })

      resolve(adx.end({ prettyPrint: true }))
    })
  }
}

function buildADX ({ entryInfo, entrySelections, entityGroups, settings }) {
  const dxm = create({ version: '1.0', encoding: 'utf-8' })
    .ele('DXMARATHON', { year: settings.year, generated_on: fmtDateTimeISO(new Date()), generated_by: 'Ham2K Marathon Tools' })

  dxm.ele('ENTRY')
    .ele('CALL').txt(entryInfo.call).up()
    .ele('ALT_CALL').txt(entryInfo.altCall).up()
    .ele('SOAPBOX').txt('Submission generated with the help of Ham2K Marathon Tools!').up()

  const entities = dxm.ele('ENTITIES')

  CQWWEntities.forEach((entity) => {
    const key = entrySelections[entity.entityPrefix]
    const qsos = entityGroups[entity.entityPrefix] ?? []
    const selected = (key && qsos.find((qso) => qso.key === key)) ?? qsos[0]

    if (selected) {
      const qso = entities.ele('QSO')
        .ele('CALL').txt(selected.their.call).up()
        .ele('OUR_CALL').txt(selected.our.call).up()
        .ele('TIME').txt(fmtDateTimeISO(selected.startAtMillis)).up()
        .ele('BAND').txt(selected.band).up()
        .ele('MODE').txt(selected.mode).up()
        .ele('PREFIX').txt(entity.entityPrefix).up()
        .ele('COUNTRY').txt(entity.name).up()
        .ele('DXCC').txt(WAE_CODES[entity.entityPrefix] || entity.dxccCode).up()

      selected.qsl?.received && Object.keys(selected.qsl).forEach(source => {
        if (source !== 'received') qso.ele('QSL', { via: source })
      })
    }
  })

  const zones = dxm.ele('ZONES')

  CQZones.forEach((zone) => {
    const key = entrySelections[zone.entityPrefix]
    const qsos = entityGroups[zone.entityPrefix] ?? []
    const selected = (key && qsos.find((qso) => qso.key === key)) ?? qsos[0]

    if (selected) {
      const qso = zones.ele('QSO')
        .ele('CALL').txt(selected.their.call).up()
        .ele('OUR_CALL').txt(selected.our.call).up()
        .ele('TIME').txt(fmtDateTimeISO(selected.startAtMillis)).up()
        .ele('BAND').txt(selected.band).up()
        .ele('MODE').txt(selected.mode).up()
        .ele('CQZ').txt(zone.zone).up()

      selected?.qsl?.received && Object.keys(selected.qsl).forEach(source => {
        if (source !== 'received') qso.ele('QSL', { via: source })
      })
    }
  })

  return dxm
}
