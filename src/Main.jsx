import React from 'react'
import { Button, Card, Box, Flex, Heading } from 'rimble-ui'
import { Link } from 'react-router-dom'
import './App.css'

export default () => {
  return (
    <Box>
      <Card maxWidth='25em' mx='auto' marginTop='1.5em'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>Couriers</Heading>
          <Link to='/jobs'>
            <Button mx='auto' my='0.5em'>Bid On Jobs</Button>
          </Link>
          <Link to='/parcels'>
            <Button mx='auto' my='0.5em'>Investigate Parcels</Button>
          </Link>
          <Link to='/drive'>
            <Button mx='auto' my='0.5em'>Drive</Button>
          </Link>
        </Flex>
      </Card>
      <Card maxWidth='25em' mx='auto' marginTop='1.5em' px={[3, 3, 4]}>
        <Flex alignItems='center'  flexDirection='column'>
          <Heading>Shippers</Heading>
          <Link to='/ship'>
            <Button mx='auto' my='0.5em'>Ship a Parcel</Button>
          </Link>
        </Flex>
      </Card>
    </Box>
  )
}