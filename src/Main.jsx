import React from 'react'
import { Button, Card, Box, Flex, Heading } from 'rimble-ui'
import { Link } from 'react-router-dom'
import './App.css'

export default () => {
  return <>
    <Box maxWidth='45em' mx='auto' marginTop='1.5em' px={[3, 3, 4]}>
      <h1>The <acronym title='Department of Happiness'>DoH</acronym>'s Ad Hoc Courier Service</h1>
      <p>To leave out this software's true purpose is controversial and potentially legally inadvisable, but omitting it hampers development. I want to sell drugs.</p>
      <p>I want people to get reliable quantities of substances backed by videos of reagent tests being done on the shipments.</p>
      <ol>
        <li>A plug gets a drop.</li>
        <li>They video the unpackaging.</li>
        <li>They video a weighing of the drop.</li>
        <li>They do reagent and whatever other tests are available to ascertain the nature of they have.</li>
        <li>They package any preorders.</li>
        <li>They create assorted additional packets from the remains.</li>
        <li>They affix to the NFC contact cards via QR coded label.</li>
        <li>They send the preorders parcel data and enter them into the courier system.</li>
        <li>A contract is created for transport where the endpoints are specified as waypoints combined with time distances from there to a rendez-vous.</li>
        <li>Couriers bid on jobs specifying timeframes and whatnot.</li>
        <li>The plug and preorders agree on a bid.</li>
        <li>The courier starts toward the first waypoint gets a private chat with the plug.</li>
        <li>The plug and courier meet in a cloud-backed recording.</li>
        <li>The courier uses a contact card to identify themselves.</li>
        <li>The plug either sells the remaining packets and their data to a courier or the courier can remain blind.</li>
        <li>The courier notifies the presales that their orders are ready for delivery.</li>
        <li>The preorders specify a waypoint and time distance to a rendez-vous.</li>
        <li>The courier bids </li>
        <li>Images of the parcel and links to pertinent videos have been sent.</li>
        <li></li>
      </ol>
    </Box>
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
  </>
}