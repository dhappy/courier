import React, { useState, useEffect } from 'react'
import { Map as LeafletMap, Marker, Popup, TileLayer, Polygon, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
//import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

export default () => {
  const [pos, setPos] = useState([51.505, -0.09])
  const [hexs, setHexs] = useState([])
  const [selected, setSelection] = useState([])

  useEffect(() => {
    const success = (pos) => setPos([pos.coords.latitude, pos.coords.longitude])
    const error = console.error
    navigator.geolocation.getCurrentPosition(success, error)
  }, [])

  useEffect(() => {
    const w = 0.015
    const theta = Math.PI / 3
    const rows = 10
    const cols = 14
    const polygons = [...new Array(rows * cols)].map((_, i) => {
      const row = Math.floor(i / rows)
      const p = {
        x: pos[0] + 2 * w * Math.sin(theta) * (i % rows) - rows / 2 * w - w,
        y: pos[1] + 3 * w * row * Math.cos(theta) - cols / 2 * w - w
      }
      if(row % 2 === 1) {
        p.x += w * Math.sin(theta)
      }
      const poly = [
        [p.x, p.y - w],
        [p.x + w * Math.sin(theta), p.y - w * Math.cos(theta)],
        [p.x + w * Math.sin(theta), p.y + w * Math.cos(theta)],
        [p.x, p.y + w],
        [p.x - w * Math.sin(theta), p.y + w * Math.cos(theta)],
        [p.x - w * Math.sin(theta), p.y - w * Math.cos(theta)],
      ]
      poly.selected = false
      return poly
    })
    setHexs(polygons)
    setSelection([...new Array(rows * cols)].map(() => false))
  }, [pos])

  const onPathCreate = console.info
  const onPathDelete = console.info
  const onPathEdit = console.info

  return (
    <LeafletMap center={pos} zoom={13} drawControl={true}>
      <TileLayer
        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <FeatureGroup>
        <EditControl
          position='topleft'
          onDrawStart={onPathEdit}
          onDrawStop={onPathEdit}
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
      <Marker position={pos}>
        <Popup>You are here.</Popup>
      </Marker>
      {hexs.map((p, i) => (
        <Polygon key={i} color={selected[i] ? 'green' : 'purple'}
          positions={p}
          onClick={() => (
            setSelection(sel => [...sel.slice(0, i), !sel[i], ...sel.slice(i + 1)])
          )}
        />
      ))}
    </LeafletMap>
  )
}
