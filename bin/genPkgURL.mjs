#!/usr/bin/env node

import fs from 'fs'
import QRCode from 'qrcode-svg'
import chalk from 'chalk'
import EthCrypto from 'eth-crypto'
import { qr2ASCII } from './utils.mjs'

const {
  address, privateKey: pK, publicKey: pubK,
} = EthCrypto.createIdentity()
const utfPK = EthCrypto.hex.compress(pK)
console.debug({ utfPK })
const url = (
  `https://bmkt.eth.link?pk=${encodeURIComponent(utfPK)}`
)

const qredURL = new QRCode({
  content: url,
  padding: 0,
  background: 'transparent',
  join: true,
  pretty: true,
  container: 'svg-viewbox',
  xmlDeclaration: false,
})
qr2ASCII(qredURL).split("\n").forEach((line) => {
  console.log(chalk.bgWhiteBright.black(line))
})
await fs.promises.writeFile(`${address}.bmkt.eth.svg`, qredURL.svg())