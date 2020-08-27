import React, { useState, useEffect } from 'react'
import { Map as LeafletMap, Marker, Popup, TileLayer } from 'react-leaflet'

export default () => {
  const [position, setPosition] = useState([51.505, -0.09])

  useEffect(() => {
    const success = (pos) => setPosition([pos.coords.latitude, pos.coords.longitude])
    const error = console.error
    navigator.geolocation.getCurrentPosition(success, error)
  }, [])
  
  return (
    <LeafletMap center={position} zoom={13}>
      <TileLayer
        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>You are here.</Popup>
      </Marker>
    </LeafletMap>
  )
}
