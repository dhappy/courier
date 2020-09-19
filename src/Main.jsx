import React from 'react'
import { Button, Card, Box, Flex, Heading } from 'rimble-ui'
import { Link } from 'react-router-dom'
import './App.css'

export default () => {
  return (
    <Box>
      <Card maxWidth='25em' mx='auto' marginTop='1.5em' px={[3, 3, 4]}>
        <Flex alignItems='center'  flexDirection='column'>
          <Heading>Anyone</Heading>
          <Link to='/ppl'>
            <Button mx='auto' my='0.5em'>Manage Contacts</Button>
          </Link>
          <Link to='/labels'>
            <Button mx='auto' my='0.5em'>Print Labels</Button>
          </Link>
        </Flex>
      </Card>
      <Card maxWidth='25em' mx='auto' marginTop='1.5em'>
        <Flex alignItems='center' flexDirection='column'>
          <Heading>Couriers</Heading>
          <Link to='/jobs/public'>
            <Button mx='auto' my='0.5em'>Find Public Jobs</Button>
          </Link>
          <Link to='/jobs/private'>
            <Button mx='auto' my='0.5em'>Check Private Jobs</Button>
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
          <Link to='/contracts/new'>
            <Button mx='auto' my='0.5em'>Ship a Parcel</Button>
          </Link>
        </Flex>
      </Card>
    </Box>
  )
}