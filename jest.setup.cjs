const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

global.fetch = jest.fn().mockImplementation(() => Promise.resolve({
  text: () => Promise.resolve('')
}))
