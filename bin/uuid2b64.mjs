#!/usr/bin/env node

import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode-svg'
import chalk from 'chalk'
import {
  b642URLB64, hex2B64, qr2ASCII, urlB642B64,
} from './utils.mjs'

const b642UUID = (b64) => (
  Buffer.from(b642URLB64(b64), 'base64')
  .toString('hex')
  .replace(
    /^(.{8})(.{4})(.{4})(.{4})(.*)$/,
    '$1-$2-$3-$4-$5',
  )
)

const uuid2URLB64 = (uuid) => {
  const hex = uuid.replace(/-/g, '')
  const b64 = hex2B64(hex)
  return b642URLB64(b64)
}

const uuid = uuidv4()
const hex = uuid.replace(/-/g, '')
const b64 = hex2B64(hex)
const urlB64 = uuid2URLB64(uuid)
console.log({
  b64, url: urlB64, back: urlB642B64(urlB64)
})
const out = b642UUID(urlB64)
console.log({ uuid, out, eql: uuid === out })

const url = new QRCode(`https://${urlB64}.bmkt.eth.link`)
qr2ASCII(url).split("\n").forEach((line) => {
  console.log(chalk.bgWhiteBright.black(line))
})
