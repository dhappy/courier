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
