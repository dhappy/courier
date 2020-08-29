import React, { useEffect, useState, useCallback } from 'react'
import {
  Map as LeafletMap, Marker, Popup, TileLayer,
  Circle, Polyline, SVGOverlay
} from 'react-leaflet'
import {
  Text, Card, Flex, Heading, Button,
  Loader, Icon, Tooltip, Input
} from 'rimble-ui'
import './App.css'

export default () => {
  const [index, setIndex] = useState(0)
  const [type, setType] = useState()
  const [pos, setPos] = useState({ lat: 53, lng: 12 })
  const [mark, setMark] = useState(pos)
  const [r, setBoundsRadius] = useState(200)
  const [time, setTime] = useState({})
  const [waypoint, setWaypoint] = useState({})

  useEffect(() => {
    const success = (pos) => {
      const actual = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setPos(actual)
      setMark(actual)
    }
    const error = (err) => alert(`Error Getting Current Position: '${err.message}'`)
    navigator.geolocation.getCurrentPosition(success, error)
  }, [])

  const updateType = (type) => {
    setType(type)
    setIndex(idx => idx + 1)
  }

  const capitalize = (word) => (
    (word || '').split('-')
    .map(p => ((p[0] && p[0].toUpperCase()) || '') + p.slice(1))
    .join('-')
  )

  // https://stackoverflow.com/a/43208163
  const toRadian = degree => degree * Math.PI / 180
  const distanceBetween = (origin, destination) => {
    const p = {
      1: { lat: toRadian(origin.lat), lng: toRadian(origin.lng) },
      2: { lat: toRadian(destination.lat), lng: toRadian(destination.lng) },
    }
    const delta = { lat: p[2].lat - p[1].lat, lng: p[2].lng - p[1].lng }
    const a = (
      Math.pow(Math.sin(delta.lat / 2), 2)
      + Math.cos(p[1].lat) * Math.cos(p[2].lat)
      * Math.pow(Math.sin(delta.lng / 2), 2)
    )
    const c = 2 * Math.asin(Math.sqrt(a))
    const EARTH_RADIUS = 6371000 // meters
    return c * EARTH_RADIUS
  }

  const delta = { lat: mark.lat - pos.lat, lng: mark.lng - pos.lng }
  const size = Math.sqrt(Math.pow(delta.lat, 2) + Math.pow(delta.lng, 2))
  const textBounds = [
    {
      lat: pos.lat + delta.lat / 2 - 2 * size, 
      lng: pos.lng + delta.lng / 2 - 5 * size,
    },
    {
      lat: pos.lat + delta.lat / 2 + 2 * size, 
      lng: pos.lng + delta.lng / 2 + 5 * size,
    }
  ]

  const dragMarker = (evt) => {
    setMark(evt.latlng)
    setBoundsRadius(distanceBetween(pos, evt.latlng))
    setTime(time => ({...time, [type]: r / 750 }))
  }

  const pages = [
    <Card>
      <Flex alignItems='center' flexDirection='column'>
        <Heading>Which are you?</Heading>
        <Flex flexDirection='row'>
          <Button mx='0.5em' onClick={() => updateType('pick-up')}>Sender</Button>
          <Button mx='0.5em' onClick={() => updateType('dropoff')}>Recipient</Button>
        </Flex>
      </Flex>
    </Card>,
    <Card>
      <Flex alignItems='center' flexDirection='column'>
        <Heading>Where are you?</Heading>
        <Text>Your location is anonymized by specifying your distance from a waypoint in terms of travel time.</Text>
        <LeafletMap center={pos} zoom={11}>
          <TileLayer
            url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="//osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={mark} draggable={true} onDrag={dragMarker}>
            <Popup>{`${capitalize(type)} Waypoint`}</Popup>
          </Marker>
          <Circle center={pos} radius={r}/>
          <Polyline positions={[pos, mark]}/>
          <SVGOverlay bounds={textBounds}>
            <text x="50%" y="50%" fill='black' fontSize={25} stroke='black' textAnchor='middle'>{time[type] && `${time[type].toFixed(1)}min`}</text>
          </SVGOverlay>
        </LeafletMap>
        <Flex alignItems='center' flexDirection='row'>
          <Text>{`${capitalize(type)} Waypoint`}</Text>
          <Input
            type='number'
            value={mark.lat}
            onChange={(evt) => {
              const lat = (
                evt.target.value !== '' ? parseFloat(evt.target.value) : pos.lat
              )
              dragMarker({ latlng: {...mark, lat } })
            }}
          />
          <Input
            type='number'
            value={mark.lng}
            onChange={(evt) => {
              const lng = (
                evt.target.value !== '' ? parseFloat(evt.target.value) : pos.lng
              )
              dragMarker({ latlng: {...mark, lng } })
            }}
          />
        </Flex>
        <Flex alignItems='center' flexDirection='row'>
          <Text>{`Time to ${type === 'pick-up' ? 'Sender' : 'Recipient'}`}</Text>
          <Input
            type='number'
            value={Math.ceil(time[type] || 0).toFixed(0)}
            onChange={(evt) => {
              const when = (
                evt.target.value !== '' ? parseFloat(evt.target.value) : time[type]
              )
              setTime(time => ({...time, [type]: when}))
            }}
          />
        </Flex>
      </Flex>
    </Card>
  ]

  return pages[index]
}