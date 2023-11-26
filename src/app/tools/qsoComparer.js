export default function qsoComparer (a, b) {
  const qslComp = (a?.qsl?.received ? 1 : 0) - (b?.qsl?.received ? 1 : 0)

  if (qslComp !== 0) return qslComp

  return a?.endOnMillis - b?.endOnMillis
}
