export const qr2ASCII = (qr) => {
  const modules = qr.qrcode.modules
  const filled = '██'
  const empty = '  '

  let out = ''
  const length = modules.length

  for(let col = 0; col < length; col++) {
    for(let row = 0; row < length; row++) {
      var module = modules[row][col]
      out += (module ? filled : empty)
    }
    out += "\n"
  }
  return out
}

export const hex2B64 = (hex) => {
  const buffer = Buffer.from(hex.replace(/^0x/, ''), 'hex')
  return buffer.toString('base64')
}

export const hex2URLB64 = (hex) => (
  b642URLB64(hex2B64(hex))
)

export const b642URLB64 = (b64) => (
  b64
  .replace(/[+]/g, '-')
  .replace(/[/]/g, '_')
  .replace(/=+$/, '')
)

export const urlB642B64 = (urlB64) => (
  urlB64
  .replace(/-/g, '+')
  .replace(/_/g, '/')
  .padEnd(3 * Math.ceil(urlB64.length / 3), '=')
)

export const b642UUID = (b64) => (
  Buffer.from(b642URLB64(b64), 'base64')
  .toString('hex')
  .replace(
    /^(.{8})(.{4})(.{4})(.{4})(.*)$/,
    '$1-$2-$3-$4-$5',
  )
)

export const uuid2URLB64 = (uuid) => {
  const hex = uuid.replace(/-/g, '')
  const b64 = hex2B64(hex)
  return b642URLB64(b64)
}