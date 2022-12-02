const SOURCE_WEIGHTS = {
  lotw: 0,
  card: 1,
  qrz: 2,
  eqsl: 3,
  default: 10,
}
export default function qslSourceComparer(a, b) {
  const aWeight = SOURCE_WEIGHTS[a.via] ?? SOURCE_WEIGHTS.default
  const bWeight = SOURCE_WEIGHTS[b.via] ?? SOURCE_WEIGHTS.default

  return bWeight - aWeight
}
