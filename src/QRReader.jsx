import React, { useState } from 'react'
import QrReader from 'react-qr-reader'
import './App.css';

export default () => {
  const [result, setResult] = useState('No Result')
   
  const handleScan = (data) => {
    if(data) {
      setResult(data)
    }
  }

  const handleError = (err) => {
    console.error(err)
  }

  return (
    <div>
      <h1>{result}</h1>
      <QrReader
        delay={200}
        onError={handleError}
        onScan={handleScan}
        style={{ width: '50vw', maxHeight: '50vh' }}
      />
    </div>
  )
}
