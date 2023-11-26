export default function qsoComparer (a, b) {
  const qslComp = (b?.qsl?.received ? 1 : 0) - (a?.qsl?.received ? 1 : 0)
  if (qslComp !== 0) return qslComp

  const notesComp = (a.notes?.length || 0) - (b.notes?.length || 0)
  if (notesComp !== 0) return notesComp

  return a?.endOnMillis - b?.endOnMillis
}
