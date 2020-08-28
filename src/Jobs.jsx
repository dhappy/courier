import React, { useState, useEffect, useCallback } from 'react'
import { Map as LeafletMap, Marker, Popup, TileLayer, Polygon, FeatureGroup } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import { Card, Flex, Heading, Table, Form, Input, Button, Loader } from 'rimble-ui'
import Box from '3box'
//import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import Web3 from 'web3'

export default () => {
  const [pos, setPos] = useState({ y: 51.505, x: -0.09 })
  const [hexs, setHexs] = useState([])
  const [zones, setZones] = useState([])
  const [contracts, setContracts] = useState([])
  const [name, setName] = useState()
  const web3 = new Web3(Web3.givenProvider)

  useEffect(() => {
    const success = (pos) => setPos({ y: pos.coords.latitude, x: pos.coords.longitude })
    const error = (err) => alert(`Error Getting Current Position: '${err.message}'`)
    navigator.geolocation.getCurrentPosition(success, error)
  }, [])

  const getProfile = useCallback(async () => {
    setName(<Loader size='80px'/>)
    const user = (await web3.eth.getAccounts())[0]
    console.info('CB', user)
    const box = await Box.openBox(user, Web3.givenProvider)
    console.info('BX', box)
    await box.syncDone
    console.info('SD', box)
    const name = await box.public.get('name')
    console.info('PFL', name)
    setName(name)
  }, [])

  useEffect(() => { getProfile() }, [getProfile])

  const extractContracts = useCallback(async (zones) => {
    //for(let zone of zones) {}
  }, [web3.eth])

  useEffect(() => { extractContracts(zones) }, [extractContracts, zones])

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
        poly.center = p
        poly.index = { row: start.row + row, col: start.col + i % cols }
        poly.contracts = []
        return poly
      })
    )
    setHexs(polys)

    const r = w * 10
    const zones = polys.filter((poly) => (
      poly.every((p) => (
        Math.sqrt(Math.pow(p[1] - pos.x, 2) + Math.pow(p[0] - pos.y, 2)) <= r
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
      <Heading>Select Your Availability Zone</Heading>
      <LeafletMap center={[pos.y, pos.x]} zoom={11}>
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
        <Marker position={[pos.y, pos.x]}>
          <Popup>You are here.</Popup>
        </Marker>
        {hexs.map((p, i) => (
          <Polygon key={i} color={zones.includes(p) ? '#048A0999' : '#AF05F722'}
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
            <tr key={`(${zone.index.row}, ${zone.index.col})`}>
              <td>{`(${zone.index.row}, ${zone.index.col})`}</td>
              <td>{zone.contracts.length}</td>
              <td>{(() => {
                // https://www.geeksforgeeks.org/program-distance-two-points-earth/
                // d = 3963.0 * arccos[(sin(lat1) * sin(lat2)) + cos(lat1) * cos(lat2) * cos(long2 – long1)]
                const rad = {
                  1: { lat: pos.y / 180 / Math.PI, long: pos.x / 180 / Math.PI }, 
                  2: { lat: zone.center.y / 180 / Math.PI, long: zone.center.x / 180 / Math.PI }, 
                }
                const dist = (
                  3963.0 * Math.acos(
                    Math.sin(rad[1].lat) * Math.sin(rad[2].lat)
                    + Math.cos(rad[1].lat) * Math.cos(rad[2].lat)
                    * Math.cos(rad[2].long - rad[1].long)
                  )
                )
                return `${dist.toFixed(2)}mi`
              })()}</td>
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
          {contracts.map((con) => (
            <tr>
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
          ))}
        </tbody>
      </Table>
    </Flex>
  )
}
