import { CQWW_ENTITIES_BY_PREFIX, CQZONES } from '@ham2k/lib-cqmag-data'

// DX Marathon form has some entities out of order
// * CE0X after CE0Z
// * FO after FO/c
// * FR after FT/j
// * FS after FT/t
// * HK0/a after HK0/m
// * VP8/h after VP8/s
const REORDERED_PREFIXES = {
  CE0X: 'CE0Zzzz',
  FO: 'FO/czzz',
  FR: 'FT/jzzz',
  FS: 'FT/tzzz',
  'HK0/a': 'HK0/mzzz',
  'VP8/h': 'VP8/szzz'
}

export const CQWWEntities = Object.values(CQWW_ENTITIES_BY_PREFIX).sort((a, b) => {
  const attr = 'entityPrefix'
  let aValue = a[attr][0] === '*' ? a[attr].slice(1) : a[attr]
  let bValue = b[attr][0] === '*' ? b[attr].slice(1) : b[attr]

  aValue = REORDERED_PREFIXES[aValue] ?? aValue
  bValue = REORDERED_PREFIXES[bValue] ?? bValue

  // Sorting should not use `localeCompare` because not all locales sort A-Z the same way
  if (aValue < bValue) return -1
  else if (aValue > bValue) return 1
  else return 0
})

export const CQZones = Object.keys(CQZONES)
  .map((k) => ({ ...CQZONES[k], zone: k, entityPrefix: `Zone ${k}` }))
  .sort((a, b) => a.zone - b.zone)

export const EntitiesAndZones = [...CQWWEntities, ...CQZones]
