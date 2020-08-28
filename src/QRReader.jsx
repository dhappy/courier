import React from 'react'
import QrReader from 'react-qr-reader'
import './App.css';

export default (props) => {
  const handleError = (err) => {
    alert(err.message)
  }

  return (
    <QrReader
      delay={200}
      onError={handleError}
      onScan={props.onScan}
      style={{ width: '50vw', maxHeight: '50vh' }}
    />
  )
}
