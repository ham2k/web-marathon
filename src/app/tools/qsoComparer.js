export default function qsoComparer (a, b) {
  const qslComp = b?.qsl?.sources?.length - a?.qsl?.sources?.length

  if (qslComp !== 0) return qslComp

  return a?.endMillis - b?.endMillis
}
