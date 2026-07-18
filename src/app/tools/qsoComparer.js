export default function qsoComparer (a, b) {
  const score = (qso) => {
    let s = 0
    if (qso?.qsl?.received) s += 10000
    if (qso?.isBadCall) s -= 100000

    const warningNotes = (qso?.notes ?? []).filter(n => n.about !== 'goodCall')
    s -= warningNotes.length * 100

    return s
  }

  const scoreComp = score(b) - score(a)
  if (scoreComp !== 0) return scoreComp

  return (a?.endOnMillis || 0) - (b?.endOnMillis || 0)
}
