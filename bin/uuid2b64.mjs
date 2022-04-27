#!/usr/bin/env node

import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode-svg'
import chalk from 'chalk'
import { qr2ASCII } from './utils.mjs'

const buffer2UUID = (buffer) => (
  buffer
  .toString('hex')
  .replace(
    /^(.{8})(.{4})(.{4})(.{4})(.*)$/,
    '$1-$2-$3-$4-$5',
  )
)

const b642URLB64 = (b64) => (
  b64
  .replace(/[+]/g, '-')
  .replace(/[/]/g, '_')
  .replace(/=+$/, '')
)

const urlB642B64 = (urlB64) => (
  b64
  .replace(/-/g, '+')
  .replace(/_/g, '/')
  .padEnd(3 * Math.ceil(b64.length / 3), '=')
)

const uuid = uuidv4()
const hex = uuid.replace(/-/g, '')
const buffer = Buffer.from(hex, 'hex')
const b64 = buffer.toString('base64')
const urlB64 = b642URLB64(b64)
console.log({
  b64, url: urlB64, back: urlB642B64(urlB64)
})
const out = buffer2UUID(buffer)
console.log({ uuid, out, eql: uuid === out })

const url = new QRCode(`https://pkg.dhappy.org?id=${urlB64}`)
qr2ASCII(url).split("\n").forEach((line) => {
  console.log(chalk.bgWhiteBright.black(line))
})
