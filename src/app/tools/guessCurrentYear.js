function guessCurrentYear () {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()

  if (month === 1 && day <= 7) {
    return today.getFullYear() - 1
  } else {
    return today.getFullYear()
  }
}

export default guessCurrentYear
