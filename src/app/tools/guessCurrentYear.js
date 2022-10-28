function guessCurrentYear() {
  const today = new Date()
  const month = today.getMonth() + 1

  if (month === 1 || month === 2) {
    return today.getFullYear() - 1
  } else {
    return today.getFullYear()
  }
}

export default guessCurrentYear
