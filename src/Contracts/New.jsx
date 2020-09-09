import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  Map as LeafletMap, Marker, Popup, TileLayer,
  Circle, Polyline, SVGOverlay
} from 'react-leaflet'
import {
  Text, Card, Flex, Heading, Button, Input, Table, Loader,
  Radio, Field, Checkbox, Box as LayoutBox
} from 'rimble-ui'
import { v5 as UUIDv5 } from 'uuid'
import UUIDEncoder from 'uuid-encoder'
import { HashLink as Link } from 'react-router-hash-link'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Box from '3box'
import Web3 from 'web3'
import { v5 as uuidv5 } from 'uuid'
import * as base58 from 'bs58'
import { commafy, capitalize, distanceBetween, chunk } from '../utils'
import QRReader from '../QRReader'

export default (props) => {
  const [type, setType] = useState()
  const [pos, setPos] = useState({ lat: 53, lng: 12 })
  const [mark, setMark] = useState(pos)
  const [r, setBoundsRadius] = useState(200)
  const [time, setTime] = useState({})
  const [other, setOther] = useState()
  const [waypoints, setWaypoints] = useState({})
  const [contacts, setContacts] = useState()
  const [bond, setBond] = useState()
  const [couriers, setCouriers] = useState([])
  const [box, setBox] = useState()
  const [joinCode] = useState(
    (new UUIDEncoder('base58'))
    .encode(UUIDv5('//pkg.dhappy.org', UUIDv5.URL))
  )
  const buffer = new Array()
  const uuid = uuidv5('https://pkg.dhappy.org', uuidv5.URL, buffer)
  let b58 = base58.encode(buffer)
  const [guid, setGUID] = useState(chunk(b58, 6).join('–'))

  useEffect(() => {
    ScrollTrigger.register(gsap)

    // let sections = gsap.utils.toArray('.card')
    // console.info(sections.length)
    // gsap.to(sections, {
    //   xPercent: -100 * (sections.length - 1),
    //   ease: 'none',
    //   scrollTrigger: {
    //     trigger: '.cards',
    //     pin: true,
    //     scrub: 1,
    //     snap: 1 / (sections.length - 1),
    //     // base vertical scrolling on how wide the container is so it feels more natural.
    //     end: () => "+=" + document.querySelector('.cards').offsetWidth
    //   }
    // });

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

  const loadContacts = useCallback(async () => {
    const user = (
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    )[0]
    const box = await Box.openBox(user, Web3.givenProvider)
    setBox(box)
    const contacts = await box.openSpace('courier-contacts')
    await contacts.syncDone
    setContacts(await contacts.private.all())
  }, [])

  useEffect(() => { loadContacts() }, [loadContacts])

  useEffect(() => {
    const success = (pos) => {
      const actual = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setPos(actual)
      setMark(actual)
    }
    const error = (err) => alert(`Error Getting Current Position: '${err.message}'`)
    navigator.geolocation.getCurrentPosition(success, error)
  }, [])

  useEffect(() => {
    const hashchange = () => {}
    window.addEventListener('hashchange', hashchange)
    return () => window.removeEventListener('hashchange', hashchange)
  }, [])

  const updateType = (type) => {
    setType(type)
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

  const navbuttons = ({ idx, onBack, onNext }) => (
    <Flex justifyContent='flex-end' flexDirection='row'>
      <Link to={`#${idx - 1}`}>
        <Button.Outline onClick={onBack} icon='ArrowBack' mt={3} mx={1}>Back</Button.Outline>
      </Link>
      <Link to={`#${idx + 1}`}>
        <Button onClick={onNext} icon='ArrowForward' mt={3} mx={1}>Next</Button>
      </Link>            
    </Flex>
  )

  return (
    <Flex className='cards' flexDirection='column'>
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
          <Text indent='1.5em' fontSize={22}>Your location is anonymized by specifying your distance from a waypoint in terms of travel time.</Text>
          <Text indent='1.5em' fontSize={22}>Please place your waypoint within ¼ mile of a public road. Once your courier is arranged you will get a chat to orchestrate your parcel pickup. If, for whatever reason, you are unresponsive, the courier will go to the waypoint.</Text>
          <Text indent='1.5em' fontSize={22}>If they still can't reach you they can register a wait complaint, but they have to be within ¼ mile of the waypoint.</Text>
          <LeafletMap center={pos} zoom={11} width={0.8} style={{ margin: '1em auto' }}>
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
            <Text fontSize='200%'>×</Text>
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
          <Flex alignItems='center' flexDirection='row' mt={3}>
            <Text mx='0.5em'>
              {`Time to ${type === 'pick-up' ? 'Sender' : 'Recipient'}:`}
            </Text>
            <Input
              width='4em'
              type='number'
              value={Math.ceil(time[type] || 0).toFixed(0)}
              onChange={(evt) => {
                const when = (
                  evt.target.value !== '' ? parseFloat(evt.target.value) : time[type]
                )
                setTime(time => ({...time, [type]: when}))
              }}
            />
            <Text>minute{time[type] === '1' ? '' : 's'}</Text>
          </Flex>
        </Flex>
        {navbuttons({
          idx: 2,
          onNext: () => setWaypoints(wps => ({...wps, [type]: mark}))
        })}
      </Card>
      <Card id='3' className='card'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>What is the package id?</Heading>
          <Text fontSize={22}>Every parcel in the network has a unique identifier that should be scannable as a QR code or NFC tag. Barring that, the id should be written on the package.</Text>
          <Flex alignItems='center' flexDirection='column'>
            <Input width='35ch' value={guid} textAlign='center' />
            <Button icon='Close'/>
            <QRReader onScan={(data) => {
              if(data) {
                const match = data.match(/^(https?:)?\/\/pkg.dhappy.org\/cel\/([^\/]+)/i)
                if(match) {
                  setGUID(match[2])
                }
              }
            }}/>
          </Flex>
        </Flex>
        {navbuttons({ idx: 3 })}
      </Card>
      <Card id='4' className='card'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>Who are you {type === 'pick-up' ? 'sending it to' : 'getting it from'}?</Heading>
          {!contacts
            ? <>
              <Heading>Loading Contacts</Heading>
              <Loader/>
            </>
            :(
              <Table>
                <thead><tr><th>Select</th><th>Names</th></tr></thead>
                <tbody>
                  {Object.entries(contacts).map(([addr, contact]) => (
                    <tr key={addr} style={{ cursor: 'pointer' }}>
                      <td><Radio checked={other === contact} onClick={(evt) => {
                        // Is getting called twice
                        console.info(evt.target.checked)
                        setOther(evt.target.checked ? undefined : contact)
                      }}/></td>
                      <td onClick={() => setOther(contact)}>{commafy(contact.names)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )
          }
        </Flex>
        {navbuttons({ idx: 4 })}
      </Card>
      <Card id='5' className='card'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>What bond do you want on the delivery?</Heading>
          <Text indent='1.5em' fontSize={22}>Couriers stake a bond as insurance for their good faith. If your courier fails to check in at a waypoint or receive a delivery receipt, this is the what you get to cover your loss.</Text>
          <Flex alignItems='center' flexDirection='row'>
            <Input
              my={3}
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
        {navbuttons({ idx: 5 })}
      </Card>
      <Card id='6' className='card'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>Choose Couriers</Heading>
          <Text indent='1.5em' fontSize='15pt'>These couriers will be notified of your contract and given an opportunity to bid.</Text>
          {!contacts
            ? <>
              <Heading>Loading Contacts</Heading>
              <Loader/>
            </>
            :(
              <Table>
                <thead><tr><th>Select</th><th>Names</th></tr></thead>
                <tbody>
                  {Object.entries(contacts).map(([addr, contact]) => (
                    <tr key={addr}>
                      <td><Checkbox checked={couriers.includes(contact)}
                      onClick={(evt) => {
                        if(evt.target.checked) {
                          setCouriers(cs => [...new Set([...cs, contact])])
                        } else {
                          setCouriers(cs => cs.filter(c => c !== contact))
                        }
                      }}/></td>
                      <td onClick={(evt) => {
                        setCouriers(cs => {
                          if(cs.includes(contact)) {
                            return cs.filter(c => c !== contact)
                          } else {
                            return [...new Set([...cs, contact])]
                          }
                        })
                      }}>{commafy(contact.names)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )
          }
        </Flex>
        {navbuttons({ idx: 6 })}
      </Card>
      <Card id='7' className='card'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>Get {type === 'pick-up' ? 'Recipient' : 'Sender'} Information</Heading>
          {other
            ? <Text fontSize={22}>The contract will now be sent to {other.names[0]} for their location information. {couriers.length > 0 && 'Links to the bidding database will be sent to the following couriers for bids:'}</Text>
            : <Text fontSize={22}>You have not <Link to='#4'>selected the other party</Link>.</Text>
          }
        </Flex>
        <Flex alignItems='start' flexDirection='column'>
          <ul>
            {couriers.map((c, i) => <li key={i}>{commafy(c.names)}</li>)}
          </ul>
        </Flex>
        {navbuttons({ idx: 7, onNext: async (evt) => {
          const user = (
            await window.ethereum.request({ method: 'eth_requestAccounts' })
          )[0]
          const box = await Box.openBox(user, Web3.givenProvider)
          const parcels = await box.openSpace('courier-parcels')
          await parcels.waitSync
          const guidBytes = base58.decode(guid.replace(/-/g, ''))
          const digest = await crypto.subtle.digest('SHA-256', guidBytes)
          const hash = base58.encode(Buffer.from(digest))
          const threadName = `bids-${hash}`
          const thread = await parcels.createConfidentialThread(threadName)
          
          const contract = {
            time, waypoints, bond,
          }

          console.info(contract)
          const posts = await thread.getPosts()
          console.info(posts)
        }})}
      </Card>
    </Flex>
  )
}