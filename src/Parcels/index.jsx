import React, { useState } from 'react'
import {
  Tooltip, Button, Card, Icon,
  Flex, Heading, Field, Input
} from "rimble-ui"
import { useHistory } from 'react-router-dom'
import QRReader from '../QRReader'

export default () => {
  const [scanning, setScanning] = useState(false)
  const [data, setData] = useState()
  const history = useHistory()

  const onScan = (data) => {
    if(data) {
      setData(data)
      const match = data.match(/^https?:\/\/(pkg|sw).dhappy.org(\/cel\/([^/]*)(\/(.+))?$)/)
      console.info(data, match)
      if(match) {
        setScanning(false)
        setData(match[3])
        if(match[1] === 'pkg') {
          history.push(match[2])
        } else {
          window.location = match[0]
        }
      }
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
                width='20em'
                placeholder='128 bits base58 encoded'
                value={data} onChange={evt => setData(evt.target.value)}
              />
              <Tooltip message='Read QR Code'>
                <Button onClick={() => setScanning(true)}>
                  <Icon name='Pages'/>
                </Button>
              </Tooltip>
            </Flex>
          </Field>
        )
      }
    </Flex>
  )   
}