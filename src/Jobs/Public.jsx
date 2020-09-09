import React, { useState, useEffect, useCallback } from 'react'
import { Map as LeafletMap, Marker, Popup, TileLayer, Polygon, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import {
  Text, Blockie, Card, Flex, Heading,
  Table, Form, Input, Button, Loader,
  Icon, Tooltip
} from 'rimble-ui'
import Box from '3box'
//import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import Web3 from 'web3'
import { distanceBetween } from '../utils'

const creator = '0xC33290860C1DA6a84195C5cf1575860d3A3ED73d' // to look up zones space
const zonesSpace = 'courier-zones'

export default () => {
  const [pos, setPos] = useState({ lat: -0.09, lng: 51.505 })
  const [hexs, setHexs] = useState([])
  const [zones, setZones] = useState([])
  const [name, setName] = useState()
  const [contracts, setContracts] = useState({})
  const [threadMgr, setThreadMgr] = useState()
  const web3 = new Web3(Web3.givenProvider)

  useEffect(() => {
    const success = (pos) => setPos({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    const error = (err) => alert(`Error Getting Current Position: '${err.message}'`)
    navigator.geolocation.getCurrentPosition(success, error)
  }, [])

  const getProfile = useCallback(async () => {
    const displayName = (text, loading = false) => (
      <Flex alignItems='center' flexDirection='column'>
        <Heading>{text}</Heading>
        {loading && <Loader size='80px'/>}
      </Flex>
    )

    try {
      setName(displayName('Loading Profile…', true))
      const user = (
        await window.ethereum.request({ method: 'eth_requestAccounts' })
      )[0]
      setName(displayName(
        <Tooltip message={user} placement='bottom'>
          <Flex alignItems='center' flexDirection='column'>
            <Heading>Researching</Heading>
            <Blockie opts={{ seed: user, size: 50 }}/>
          </Flex>
        </Tooltip>,
        true
      ))
      const box = await Box.openBox(user, Web3.givenProvider)
      setName(displayName('Opened Box…', true))
      await box.syncDone
      setName(displayName('Getting Name…', true))
      await Promise.all([
        (async () => setName(displayName(
          `Welcome ${await box.public.get('name')}`
        )))(),
        (async () => {
          let threadMgr = await Box.getSpace(creator, zonesSpace)
          if(Object.keys(threadMgr).length === 0) {
            if(user.toLowerCase() === creator.toLowerCase()) {
              threadMgr = await box.openSpace(zonesSpace)
            } else {
              alert("Couldn't find the thread manager.")
            }
          }
          setThreadMgr(threadMgr)
        })(),
      ])
    } catch(err) {
      alert(`Error Connecting to 3Box: '${err.message}'`)
      setName(displayName('Loading Failed'))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { getProfile() }, [getProfile])

  const refreshContracts = useCallback(async (zones) => {
    if(threadMgr) {
      const validContract = async (post) => (
        post.type === 'contract'
        && (await web3.eth.getBlockNumber()) <= post.expires
      )
      const contracts = {}
      for(let zone of zones) {
        if(!zone.addr) {
          zone.addr = await threadMgr.public.get(`zone-db-${zone.id}`)
        }
        if(zone.addr) {
          const thread = await threadMgr.joinThreadByAddress(zone.addr)
          const posts = await thread.getPosts()
          const isContract = await Promise.all(posts.map(validContract))
          contracts[zone.id] = posts.filter((_, i) => isContract[i])
        }
      }
      setContracts(contracts)
    }
  }, [threadMgr])

  useEffect(() => { refreshContracts(zones) }, [refreshContracts, zones])

  useEffect(() => {
    const w = 0.015
    const theta = 2 * Math.PI / 6
    const start = {
      row: Math.floor(pos.lng / (2 * w)),
      col: Math.floor(pos.lat / (2 * w * Math.sin(theta))),
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
            pos.lng + row * 1 * w * Math.sin(theta)
            - (full.width / 4 - one.width / 2)
          ),
          y: (
            pos.lat + (i % rows) * 3 * w
            - (3 * full.height / 4 + one.height / 2)
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
        poly.center = { lat: p.y, lng: p.x }
        poly.index = { row: start.row + row, col: start.col + i % cols }
        poly.id = `(${poly.index.row},${poly.index.col})`
        poly.contracts = []
        return poly
      })
    )
    setHexs(polys)

    const r = w * 10
    const zones = polys.filter((poly) => (
      poly.every((p) => (
        Math.sqrt(Math.pow(p[1] - pos.lng, 2) + Math.pow(p[0] - pos.lat, 2)) <= r
      ))
    ))
    setZones(zones)
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
      {name &&
        <Card><Heading>{name}</Heading></Card>
      }
      <Heading>#1. Select Your Availability Zone</Heading>
      <LeafletMap center={pos} zoom={11}>
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
                shapeOptions: { color: '#FF0000AA' },
              },
            }}
          />
        </FeatureGroup>
        <Marker position={pos}>
          <Popup>You are here.</Popup>
        </Marker>
        {hexs.map((p, i) => (
          <Polygon key={i}
            color={
              !zones.includes(p)
              ? '#AF05F722'
              : (p.addr ? '#048A0999' : '#FF7B0099')
            }
            positions={p}
            onClick={() => {
              setZones((zones) => {
                const select = !zones.includes(p)
                if(select) {
                  return [p, ...zones]
                } else {
                  return zones.filter(z => z !== p)
                }
              })
            }}
          />
        ))}
      </LeafletMap>
      <Table>
        <thead><tr>
          <th>Zone ID</th>
          <th># of Open Contracts</th>
          <th>🕊 to Center</th>
        </tr></thead>
        <tbody>
          {zones.map((zone) => (
            <tr key={zone.id}>
              <td>{zone.id}</td>
              <td>{zone.contracts.length}</td>
              <td>{(distanceBetween(pos, zone.center) / 1000).toFixed(2)}km</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Table>
        <thead><tr>
          <th>🕊 to Pickup Waypoint</th>
          <th>Waypoint to Sender</th>
          <th>🕊 Pickup to Dropoff Waypoint</th>
          <th>Waypoint to Recipient</th>
          <th>Bid</th>
        </tr></thead>
        <tbody>
          {zones.map((zone) => (
            (contracts[zone.id] || []).map((con) => (
              <tr id={zone.id} key={zone.id}>
                <td>{con.pickup.waypoint}</td>
                <td>{con.pickup.travelTime}</td>
                <td>{con.dropoff.waypoint + con.pickup.waypoint}</td>
                <td>{con.dropoff.travelTime}</td>
                <td>
                  <Form onSubmit={alert}>
                    <Input type='number' name='bid' />
                    <Button>Bid</Button>
                  </Form>
                </td>
              </tr>
            ))
          ))}
        </tbody>
      </Table>
    </Flex>
  )
}
