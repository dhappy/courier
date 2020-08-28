import React, { useState } from 'react'
import {
  Tooltip, Button, Card, Icon,
  Flex, Heading, Field, Input
} from "rimble-ui"
import QRReader from './QRReader'

export default () => {
  const [scanning, setScanning] = useState(false)
  const [data, setData] = useState()

  const onScan = (data) => {
    if(data) {
      setScanning(false)
      setData(data)
    }
  }

  return (
    <Flex alignItems='center' flexDirection='column'>
      {scanning
        ? (
          <QRReader onScan={onScan}/>
        )
        : (
          <Field label="Package ID">
            <Flex alignItems='center' flexDirection='row'>
              <Input type='text' required={true}
                width='25em'
                placeholder='128 bits base58 encoded'
                value={data} onChange={evt => setData(evt.target.value)}
              />
              <Tooltip message='Read QR Code'>
                <Button onClick={() => setScanning(true)}>
                  <Icon color="tomato" name="Pages" size="80"/>
                </Button>
              </Tooltip>
            </Flex>
          </Field>
        )
      }
    </Flex>
  )   
}