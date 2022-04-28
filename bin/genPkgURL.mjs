#!/usr/bin/env node

import fs from 'node:fs'
import QRCode from 'qrcode-svg'
import EthCrypto from 'eth-crypto'
import { v4 as uuidv4 } from 'uuid'
import chalk from 'chalk'
import { hex2URLB64, uuid2URLB64 } from './utils.mjs'

const defaults = {
  padding: 4,
  // background: 'transparent',
  join: true,
  pretty: true,
  //container: 'svg-viewbox',
  xmlDeclaration: false,
}

const write = async ({ svg, file }) => {
  const [, ...dirs] = file.split('/').reverse()
  const path = dirs.reverse().join('/')
  if(path.length > 0) {
    try {
      await fs.promises.access(path, fs.constants.F_OK)
    } catch(dne) {
      await fs.promises.mkdir(path, { recursive: true })
    }
  }
  await fs.promises.writeFile(file, svg)
  console.info(
    chalk.red('Wrote:')
    + ` ${chalk.green('“')}${chalk.blueBright(file)}${chalk.green('”')}`
  )
}

let done = false
let addr, pubK, hexPK, utfPK
while(!done) {
  try {
    const {
      address, privateKey, publicKey,
    } = EthCrypto.createIdentity()
    addr = address
    hexPK = privateKey
    pubK = publicKey

    utfPK = EthCrypto.hex.compress(hexPK)
    
    const utf16PKQR = new QRCode({
      ...defaults, content: utfPK,
    })
    
    await write({
      file: `${addr}/pk.utf16.svg`,
      svg: utf16PKQR.svg(),
    })

    done = true
  } catch(encErr) {
    console.error(`Failed to encode: ${hexPK}`)
    console.debug(encErr.message)
  }
}

const uuid = uuidv4()
const b64UUID = uuid2URLB64(uuid)
const b64PK = hex2URLB64(hexPK)

const url = (
  `https://${b64UUID}.bmkt.eth.link?pk=${b64PK}`
)

const b64FullURLQR = new QRCode({
  ...defaults, content: url,
})

await write({
  file: `${addr}/UUUID+bmkt.eth+b64pk.svg`,
  svg: b64FullURLQR.svg(),
})

const b64PKQR = new QRCode({
  ...defaults, content: b64PK,
})

await write({
  file: `${addr}/pk.b64.svg`,
  svg: b64PKQR.svg(),
})

const hexPKQR = new QRCode({
  ...defaults, content: hexPK,
})

await write({
  file: `${addr}/pk.hex.svg`,
  svg: hexPKQR.svg(),
})
