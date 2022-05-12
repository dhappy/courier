import React, { useState, useEffect, useCallback } from 'react'
import {
  Button, Flex, Card, Field,
} from 'rimble-ui'
import { v1 as uuidv1 } from 'uuid'
import * as base58 from 'bs58'
import QRCode from 'qrcode'
import { chunk } from '../utils'
import { create } from 'ipfs-http-client';

const links = async (path) => {
  // const url = 'https://dweb.link/api/v0'
  const url = 'http://localhost:5001/api/v0'
  
  const ipfs = create({ url })
  const links = []
  for await (const link of ipfs.ls(path)) {
    links.push(link)
  }
  return links
}

export default () => {
  const [page, setPage] = useState({width: 8.5, height: 11})
  const [label, setLabel] = useState({width: 2 + 5/8, height: 2})
  const [innerGutter, setInnerGutter] = useState({width: 1/8, height: 0})
  const [outerGutter, setOuterGutter] = useState({width: 7/32, height: 15/32})
  const [data, setData] = useState([])
  const [images, setImages] = useState([])

  const dpi = 96 // inkscape default
  const presets = {
    'Avery 6793 (15×(2"×2⅝"))': {
      page: { width: 8.5, height: 11 },
      label: { width: 2 + 5/8, height: 2 },
      outerGutter: { width: 7/32, height: 15/32 },
      innerGutter: { width: 1/8, height: 0 },
    },
    'Avery 6874 (6×(3"×3¾"))': {
      page: { width: 8.5, height: 11 },
      label: { width: 3 + 3/4, height: 3 },
      outerGutter: { width: 3/8, height: 5/8 },
      innerGutter: { width: 1/4, height: 3/8 },
    },
  }
  const setters = {
    page: setPage, label: setLabel,
    innerGutter: setInnerGutter, outerGutter: setOuterGutter,
  }

  useEffect(() => {
    const load = async () => {
      setImages(await links('QmT8fxdiii2hagjjTNf5xRwneW5KNopCNQaegLwuyVYZgu'))      
    }
    load()       
  }, [])
  const genData = useCallback(async () => {
    const rows = Math.round((page.height - outerGutter.height * 2 + innerGutter.height) / (label.height + innerGutter.height))
    const cols = Math.round((page.width - outerGutter.width * 2 + innerGutter.width) / (label.width + innerGutter.width))

    const ids = (
      [...new Array(Math.round(rows * cols))].map(genId)
    )
    const qrs = await Promise.all(
      ids.map((guid) => (
        new Promise((resolve, reject) => {
          QRCode.toString(
            `https://pkg.dhappy.org/#/cel/${guid}`,
            { margin: 0, errorCorrectionLevel: 'low' },
            (err, string) => {
              if(err) throw err
              resolve(string)
            }
          )
        })
      ))
    )
    const data = ids.map((id, i) => ({ guid: id, qr: qrs[i] }))
    setData(chunk(data, cols))
  }, [page, label, outerGutter, innerGutter])

  useEffect(() => { genData() }, [genData])

  const setter = (dim, axis) => (
    (evt) => {
      const val = evt.target.value
      if(!setters[dim]) {
        console.error(`No Setter For: ${dim}`)
      } else {
        setters[dim](old => ({...old, [axis]: val}))
      }
    }
  )

  const genId = () => {
    const buffer = new Array()
    const uuid = uuidv1({}, buffer)
    return base58.encode(buffer)
  }

  const idView = (guid) => {
    const rows = chunk(guid, 8)
    return (
      <text style={{textAnchor: 'middle', fontFamily: "'Source Code Pro', monospace", fontSize: 25}} >
        {rows.map((r, i) => (
          <tspan key={i} x={label.height / 2 * dpi} dy={25}>{chunk(r, Math.ceil(r.length / 2)).join('-')}</tspan>
        ))}
      </text>
    )
  }

  const image = () => {
    if(images.length > 0) {
      const selected = images[Math.floor(images.length * Math.random())]
      return (
        // <image xlinkHref={`http://ipfs.io/ipfs/${selected.path}`} x="3%" y="-1.25%" height="6rem"/>
        <image xlinkHref={`http://localhost:8888/ipfs/${selected.path}`} x="4%" y="-1.25%" height="6rem"/>
      )
    }
  }

  const lbl = (datum, row, col) => {
    const x = (outerGutter.width + col * (label.width + innerGutter.width)) * dpi
    const y = (outerGutter.height + row * (label.height + innerGutter.height)) * dpi
    const initY = (outerGutter.height + label.height / 2) * dpi
    const qrSize = Math.min(label.width, label.height) * 0.8 * dpi
    return (
      <g key={datum.guid} transform={`translate(${x}, ${y}) rotate(-90) translate(${-initY}, 0)`}>
        {/* {idView(datum.guid)} */}
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
    <Flex alignItems='center' flexDirection='column'>
      <Button onClick={() => links('QmT8fxdiii2hagjjTNf5xRwneW5KNopCNQaegLwuyVYZgu')}> List Images
      </Button>
      <Button onClick={() => console.log('HI')}> SAYHI!!
      </Button>
      <Card className='config'><Flex flexDirection='column'>
        <form>
          <fieldset>
            <label>Page Size:</label>
            <input type='number' value={page.width} onChange={setter('page', 'width')}/>
            <span>×</span>
            <input value={page.height} onChange={setter('page', 'height')}/>
          </fieldset>
          <fieldset>
            <label>Label:</label>
            <input value={label.width} onChange={setter('label', 'width')}/>
            <span>×</span>
            <input value={label.height} onChange={setter('label', 'height')}/>
          </fieldset>
          <fieldset>
            <label>Outer Gutters:</label>
            <input value={outerGutter.width} onChange={setter('outerGutter', 'width')}/>
            <span>×</span>
            <input value={outerGutter.height} onChange={setter('outerGutter', 'height')}/>
          </fieldset>
          <fieldset>
            <label>Inner Gutters:</label>
            <input value={innerGutter.width} onChange={setter('innerGutter', 'width')}/>
            <span>×</span>
            <input value={innerGutter.height} onChange={setter('innerGutter', 'height')}/>
          </fieldset>
        </form>
        <Field label='Presets:'>
          <select onChange={(evt) => {
            const preset = presets[evt.target.value]
            for(let prop of Object.keys(setters)) {
              setters[prop](preset[prop])
            }
          }}>
            {Object.keys(presets).map((opt, i) => <option key={i}>{opt}</option>)}
          </select>
        </Field>
      </Flex></Card>
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
   </Flex>
  )
}