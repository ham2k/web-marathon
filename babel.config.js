let testMode

try {
  testMode = process.env.NODE_ENV === 'test'
} catch (e) {
  testMode = true
}

const presets = ['@babel/preset-env', '@babel/preset-react']
const plugins = []

if (testMode) {
  plugins.push('babel-plugin-transform-import-meta')
}

module.exports = {
  presets
}
