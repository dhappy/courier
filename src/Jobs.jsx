import React, { useState, useEffect } from 'react'
import { Map as LeafletMap, Marker, Popup, TileLayer, Polygon, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import { Flex, Heading } from 'rimble-ui'
//import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

export default () => {
  const [pos, setPos] = useState({ y: 51.505, x: -0.09 })
  const [hexs, setHexs] = useState([])
  const [selected, setSelection] = useState([])

  useEffect(() => {
    const success = (pos) => setPos({ y: pos.coords.latitude, x: pos.coords.longitude })
    const error = (err) => alert(`Error Getting Current Position: '${err.message}'`)
    navigator.geolocation.getCurrentPosition(success, error)
  }, [])

  useEffect(() => {
    const w = 0.015
    const theta = 2 * Math.PI / 6
    const start = {
      row: Math.floor(pos.y / (2 * w)),
      col: Math.floor(pos.x / (2 * w * Math.sin(theta))),
    }
    const rows = 12
    const cols = 35
    const one = {
      width: 2 * w * Math.sin(theta), height: 2 * w,
    }
    const full = {
      width: cols * one.width, height: rows * one.height,
    }
    const polys = (
      [...new Array(rows * cols)].map((_, i) => {
        const row = Math.floor(i / rows)
        const p = {
          x: (
            pos.x + row * 1 * w * Math.sin(theta)
            - (full.width / 4 - one.width / 2)
          ),
          y: (
            pos.y + (i % rows) * 3 * w
            - (full.height / 2 + one.height / 2)
          ),
        }
        if(row % 2 === 1) {
          p.y += 3 * w * Math.cos(theta)
        }
        const poly = [
          [p.y - w, p.x],
          [p.y - w * Math.cos(theta), p.x + w * Math.sin(theta)],
          [p.y + w * Math.cos(theta), p.x + w * Math.sin(theta)],
          [p.y + w, p.x],
          [p.y + w * Math.cos(theta), p.x - w * Math.sin(theta)],
          [p.y - w * Math.cos(theta), p.x - w * Math.sin(theta)],
        ]
        poly.index = { row: start.row + row, col: start.col + i % cols }
        return poly
      })
    )
    setHexs(polys)

    const r = w * 10
    setSelection([...new Array(polys.length)].map((_, i) => (
      polys[i].every((p) => (
        // ToDo: Fix this to be a circle
        Math.sqrt(Math.pow(p[1] - pos.x, 2) - Math.pow(p[0] - pos.y, 2)) > r
      ))
    )))
  }, [pos])

  const onPathCreate = console.info
  const onPathDelete = console.info
  const onDrawStop = (evt) => {
    console.info('DSTP', evt)
  }
  const onDrawStart = (evt) => {
    console.info('DSTRT', evt)
  }

  return (
    <Flex alignItems='center' flexDirection='column'>
      <Heading>Select Your Availability Zone</Heading>
      <LeafletMap center={[pos.y, pos.x]} zoom={12}>
        <TileLayer
          url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup>
          <EditControl
            position='topleft'
            onDrawStart={onDrawStart}
            onDrawStop={onDrawStop}
            onCreated={onPathCreate}
            onDeleted={onPathDelete}
            draw={{
              polyline: false,
              polygon: false,
              marker: false,
              rectangle: false,
              circlemarker: false,
              circle: {
                shapeOptions: { color: '#F00' },
              },
            }}
          />
        </FeatureGroup>
        <Marker position={[pos.y, pos.x]}>
          <Popup>You are here.</Popup>
        </Marker>
        {hexs.map((p, i) => (
          <Polygon key={i} color={selected[i] ? 'green' : '#af05f722'}
            positions={p}
            onClick={() => {
              console.log(p.index)
              setSelection(sel => [...sel.slice(0, i), !sel[i], ...sel.slice(i + 1)])
            }}
          />
        ))}
      </LeafletMap>
    </Flex>
  )
}
