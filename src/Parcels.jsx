import React, { useState } from 'react'
import { Button, Card, Icon, Flex, Heading, Field, Input } from "rimble-ui"
import QRReader from './QRReader'

export default () => {
  const [scanning, setScanning] = useState(true)
  const [data, setData] = useState()

  const onScan = (data) => {
    setScanning(false)
    setData(data)
  }

  return (
    <Flex alignItems='center' flexDirection='column'>
      {data && <Card><Heading>{data}</Heading></Card>}
      {scanning
        ? (
          <QRReader onScan={onScan}/>
        )
        : (
          <Flex alignItems='center' flexDirection='row'>
            <Field label="Package ID">
              <Input type='search' required={true} placeholder='4oZGBxUc8bWxpmjurJucKr' />
            </Field>
            <Button onClick={() => setScanning(true)}>
              <Icon color="tomato" name="Pages" size="80"/>
            </Button>
          </Flex>
        )
      }
    </Flex>
  )   
}