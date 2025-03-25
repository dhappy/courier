import React, { useState, useEffect, useCallback } from 'react'
import {
  chakra, Button, Flex, Input, Box, Stack,
  FormControl, FormLabel, Text, Select,
} from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid'
import QRCode from 'qrcode'
import { chunk, b64URL } from '../utils'
import { create as mkIPFS } from 'ipfs-http-client';
import Head from 'next/head'

type Datum = {
  guid: string,
  qr: string,
}

const links = async (path: string) => {
  // const url = 'https://dweb.link/api/v0'
  const url = 'http://localhost:5001/api/v0'

  const ipfs = mkIPFS({ url })
  const links = []
  for await (const link of ipfs.ls(path)) {
    links.push(link)
  }
  return links
}

const genId = () => {
  const buffer: Array<any> = []
  uuidv4({}, buffer)
  return b64URL(Buffer.from(buffer))
}

const Labels = () => {
  const [page, setPage] = useState({ width: 8.5, height: 11 })
  const [label, setLabel] = useState({ width: 2 + 5 / 8, height: 2 })
  const [innerGutter, setInnerGutter] = useState({ width: 1 / 8, height: 0 })
  const [outerGutter, setOuterGutter] = useState({ width: 7 / 32, height: 15 / 32 })
  const [data, setData] = useState<Array<Array<Datum>>>([])
  const [images, setImages] = useState<Array<string>>([])
  const [cid, setCID] = useState(
    'QmT78WwV1oBSoVcn7McMjdGKQBt1ZNpSck2AZxAhAoYjXe'
  )
  const [url, setURL] = useState(
    'https://ship.via.autos/pkg/{guid}'
  )
  const [regen, setRegen] = useState(false)

  const dpi = 96 // inkscape default
  const presets = {
    'Avery 6793 (15×(2″×2⅝″))': {
      page: { width: 8.5, height: 11 },
      label: { width: 2 + 5 / 8, height: 2 },
      outerGutter: { width: 7 / 32, height: 15 / 32 },
      innerGutter: { width: 1 / 8, height: 0 },
    },
    'Avery 6874 (6×(3″×3¾″))': {
      page: { width: 8.5, height: 11 },
      label: { width: 3 + 3 / 4, height: 3 },
      outerGutter: { width: 3 / 8, height: 5 / 8 },
      innerGutter: { width: 1 / 4, height: 3 / 8 },
    },
  } as const
  const setters = {
    page: setPage, label: setLabel,
    innerGutter: setInnerGutter, outerGutter: setOuterGutter,
  }

  const addImages = useCallback(async (cid: string) => {
    const list = (await links(cid)).map((l) => l.path ?? l)
    setImages((imgs) => [...imgs, ...list])
  }, [])

  const genData = useCallback(async () => {
    const rows = (
      (label.height + innerGutter.height === 0) ? (
        10
      ) : (
        Math.max(0, Math.round(
          (page.height - outerGutter.height * 2 + innerGutter.height)
          / (label.height + innerGutter.height)
        ))
      )
    )
    const cols = (
      (label.width + innerGutter.width === 0) ? (
        10
      ) : (
        Math.max(0, Math.round(
          (page.width - outerGutter.width * 2 + innerGutter.width)
          / (label.width + innerGutter.width)
        ))
      )
    )

    const ids = (
      [...new Array(Math.round(rows * cols))].map(genId)
    )
    const qrs = await Promise.all(
      ids.map((guid) => (
        new Promise<string>((resolve, reject) => {
          QRCode.toString(
            url.replace(/\{guid\}/g, guid),
            { margin: 2, errorCorrectionLevel: 'low' },
            (err, str) => {
              if (err) {
                reject(err.message)
              } else {
                resolve(str)
              }
            }
          )
        })
      ))
    )
    const data = ids.map((id, i) => ({ guid: id, qr: qrs[i] }))
    setData(chunk(data, cols) as Array<Array<Datum>>)
  }, [page, label, outerGutter, innerGutter])

  useEffect(() => { genData() }, [genData])

  const setter = (dim: string, axis: string) => (
    ({ target: { value } }: { target: { value: string } }) => {
      if (!setters[dim as keyof typeof setters]) {
        console.error(`No Setter For: ${dim}`)
      } else {
        setters[dim as keyof typeof setters](
          (old) => ({ ...old, [axis]: Number(value) })
        )
      }
    }
  )

  const image = () => {
    if (images.length > 0) {
      const selected = images[Math.floor(images.length * Math.random())]
      return (
        // <image xlinkHref={`http://ipfs.io/ipfs/${selected.path}`} x="3%" y="-1.25%" height="6rem"/>
        <image xlinkHref={`http://localhost:8888/ipfs/${selected}`} x="4%" y="-1.25%" height="4rem" />
      )
    }
  }

  const lbl = (datum: Datum, row: number, col: number) => {
    const x = (outerGutter.width + col * (label.width + innerGutter.width)) * dpi
    const y = (outerGutter.height + row * (label.height + innerGutter.height)) * dpi
    const initY = (outerGutter.height + label.height / 2) * dpi
    const qrSize = Math.min(label.width, label.height) * 0.8 * dpi
    return (
      <g key={datum.guid} transform={`translate(${x}, ${y}) rotate(-90) translate(${-initY}, 0)`}>
        {image()}
        <image
          width={qrSize} height={qrSize}
          x={qrSize * 0.22 / 2} y={label.width * dpi - qrSize - qrSize * 0.05}
          xlinkHref={`data:image/svg+xml;utf8,${encodeURIComponent(datum.qr)}`}
        />
      </g>
    )
  }

  return (
    <Stack align='center'>
      <Head>
        <title>Labels</title>
      </Head>
      <Stack
        className='config'
        sx={{ '@media print': { display: 'none' } }}
      >
        <Box as="form">
          <FormControl>
            <FormLabel>Page Size:</FormLabel>
            <Flex ml={4}>
              <Input
                type="number"
                value={page.width}
                onChange={setter('page', 'width')}
              />
              <Text as="span" fontSize={40}>”</Text>
              <Text as="span" fontSize={40}>×</Text>
              <Input
                type="number"
                value={page.height}
                onChange={setter('page', 'height')}
              />
              <Text as="span" fontSize={40}>”</Text>
            </Flex>
          </FormControl>
          <FormControl>
            <FormLabel>Label Size:</FormLabel>
            <Flex ml={4}>
              <Input
                type="number"
                value={label.width}
                onChange={setter('label', 'width')}
              />
              <Text as="span" fontSize={40}>”</Text>
              <Text as="span" fontSize={40}>×</Text>
              <Input
                type="number"
                value={label.height}
                onChange={setter('label', 'height')}
              />
              <Text as="span" fontSize={40}>”</Text>
            </Flex>
          </FormControl>
          <FormControl>
            <FormLabel>Outer Gutter Size:</FormLabel>
            <Flex ml={4}>
              <Input
                type="number"
                value={outerGutter.width}
                onChange={setter('outerGutter', 'width')}
              />
              <Text as="span" fontSize={40}>”</Text>
              <Text as="span" fontSize={40}>×</Text>
              <Input
                type="number"
                value={outerGutter.height}
                onChange={setter('outerGutter', 'height')}
              />
              <Text as="span" fontSize={40}>”</Text>
            </Flex>
          </FormControl>
          <FormControl>
            <FormLabel>Inner Gutter Size:</FormLabel>
            <Flex ml={4}>
              <Input
                type="number"
                value={innerGutter.width}
                onChange={setter('innerGutter', 'width')}
              />
              <Text as="span" fontSize={40}>”</Text>
              <Text as="span" fontSize={40}>×</Text>
              <Input
                type="number"
                value={innerGutter.height}
                onChange={setter('innerGutter', 'height')}
              />
              <Text as="span" fontSize={40}>”</Text>
            </Flex>
          </FormControl>
        </Box>
        <FormControl>
          <FormLabel>Presets:</FormLabel>
          <Select 
            ml={4}
            onChange={
              ({ target: { value } }:{ target: { value: string } }) => {
                const key = value as keyof typeof presets
                const preset = presets[key]
                for (let prop of Object.keys(setters)) {
                  setters[prop as keyof typeof setters](
                    preset[prop as keyof typeof preset]
                  )
                }
              }
            }
          >
            {Object.keys(presets).map((opt, i) => (
              <chakra.option key={i}>{opt}</chakra.option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Add Images:</FormLabel>
          <Flex ml={4}>
            <Input
              flexGrow={1}
              value={cid}
              onChange={
                ({ target: { value } }: { target: { value: string } }) => (
                  setCID(value)
                )
              }
            />
            <Button colorScheme="blue" onClick={() => addImages(cid)}>
              <Text as="span" role="img">➕</Text>
            </Button>
          </Flex>
        </FormControl>
        <FormControl>
          <FormLabel>URL Template:</FormLabel>
          <Flex ml={4}>
            <Input
              flexGrow={1}
              value={url}
              onChange={
                ({ target: { value } }: { target: { value: string } }) => (
                  setURL(value)
                )
              }
            />
          </Flex>
        </FormControl>
        <FormControl>
          <Flex justify="center">
            <Button colorScheme="green" onClick={() => setRegen((r) => !r)}>
              Regenerate
            </Button>
          </Flex>
        </FormControl>
      </Stack>
      <Flex>
        <svg
          viewBox={[0, 0, page.width * dpi, page.height * dpi].join(' ')}
          width={`${page.width}in`} height={`${page.height}in`}
          transform={`translate(0, ${outerGutter.height * dpi})`}
        >
          {data.map((row, ridx) => (
            row.map((datum, cidx) => lbl(datum, ridx, cidx))
          ))}
        </svg>
      </Flex>
    </Stack>
  )
}

export default Labels
