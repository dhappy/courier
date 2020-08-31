import React, { useEffect, useState, useRef } from 'react'
import {
  Map as LeafletMap, Marker, Popup, TileLayer,
  Circle, Polyline, SVGOverlay
} from 'react-leaflet'
import {
  Text, Card, Flex, Heading, Button, Box,
  Loader, Icon, Tooltip, Input, EthAddress
} from 'rimble-ui'
import { v5 as UUIDv5 } from 'uuid'
import UUIDEncoder from 'uuid-encoder'
import { HashLink as Link } from 'react-router-hash-link'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import './App.css'

export default (props) => {
  const [index, setIndex] = useState(props.match.params.index || 0)
  const [type, setType] = useState()
  const [pos, setPos] = useState({ lat: 53, lng: 12 })
  const [mark, setMark] = useState(pos)
  const [r, setBoundsRadius] = useState(200)
  const [time, setTime] = useState({})
  const [waypoint, setWaypoint] = useState({})
  const [bond, setBond] = useState()
  const [joinCode] = useState(
    (new UUIDEncoder('base58'))
    .encode(UUIDv5('//pkg.dhappy.org', UUIDv5.URL))
  )
  const joinPath = `/contracts/${joinCode}/join`
  const joinURL = `https://pkg.dhappy.org/#${joinPath}`

  const [cards] = useState([...(new Array(5))].map(() => useRef(null)))

  useEffect(() => {
    ScrollTrigger.register(gsap)

    let sections = gsap.utils.toArray('.card')
    console.info(sections.length)
    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: '.cards',
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        // base vertical scrolling on how wide the container is so it feels more natural.
        end: () => "+=" + document.querySelector('.cards').offsetWidth
      }
    });

    // const tl = gsap.timeline()
    // tl.from('.map', { xPercent: 20, width: '60%' })
    // gsap.to(cards[1].current, {
    //   scrollTrigger: {
    //     trigger: cards[1].current,
    //     // enter from bottom, leave top, enter from top, leave bottom
    //     toggleActions: 'restart pause reverse pause',
    //     // element top hits viewport center
    //     start: 'top center',
    //     end: 'bottom center',
    //     markers: true,
    //     scrub: true,
    //   },
    //   x: 300, width: '-=600', duration: 2
    // })
  }, [])

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

  return (
    <Flex className='cards'>
      <Card id='1' className='card'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>Which are you?</Heading>
          <Flex flexDirection='row'>
            <Link to='#2' onClick={() => updateType('pick-up')}>
              <Button variant={type === 'pick-up' && 'success'} mx='0.5em'>Sender</Button>
            </Link>
            <Link to='#2' onClick={() => updateType('dropoff')}>
              <Button variant={type === 'dropoff' && 'success'} mx='0.5em'>Recipient</Button>
            </Link>
          </Flex>
        </Flex>
      </Card>
      <Card id='2' className='card map'>
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
            <Text mx='0.5em'>{`${capitalize(type)} Waypoint:`}</Text>
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
            <Text mx='0.5em'>
              {`Time to ${type === 'pick-up' ? 'Sender' : 'Recipient'}:`}
            </Text>
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
          <Link to='#3'><Button>Next</Button></Link>            
        </Flex>
      </Card>
      <Card id='3' className='card'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>Who are you {type === 'pick-up' ? 'sending it to' : 'getting it from'}?</Heading>
          <Text>One aspect of the system is that you only know the waypoint of the other party. The courier has a private chat with each party where they orchestrate their specific meeting.</Text>
          <Text>You can invite the {type === 'pick-up' ? 'recipient' : 'sender'} by sending them this url: <Link to={joinPath}>{joinURL}</Link></Text>
        </Flex>
      </Card>
      <Card id='4' className='card'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>What bond do you want on the delivery?</Heading>
          <Text>Couriers have staked a bond as insurance for their good faith. If your courier fails to check in at a waypoint or receive a delivery receipt, this is the amount you get to cover the loss of your parcel.</Text>
          <Flex alignItems='center' flexDirection='row'>
            <Input
              type='number'
              value={bond}
              onChange={(evt) => {
                const bond = (
                  evt.target.value !== '' ? parseFloat(evt.target.value) : 0
                )
                if(bond < 0) bond *= -1
                setBond(bond)
              }}
            />
          </Flex>
        </Flex>
      </Card>
      <Card id='5' className='card'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>Who is providing oversight?</Heading>
          <Text>The oversight handler is available to handle situations where human intervention may be necessary. </Text>
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
      </Card>
    </Flex>
  )
}