import React, { useState, useEffect, useCallback } from 'react'
import { Flex, Heading, Button, Input, Card, Loader } from 'rimble-ui'
import { HashLink as Link } from 'react-router-hash-link'
import { Redirect } from 'react-router-dom'
import Box from '3box'
import Web3 from 'web3'

export default (props) => {
  const [loading, setLoading] = useState(false)
  const [log, setLog] = useState([])
  const logger = (msg) => setLog(log => [...log, msg])

  const checkForParcel = useCallback(async (guid) => {
    setLoading(true)
    const user = (
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    )[0]
    logger(`Got Address: ${user}`)
    const box = await Box.openBox(user, Web3.givenProvider)
    logger(`Awaiting 3Box…`)
    await box.waitSync
    logger(`Got 3Box…`)
    const space = await box.openSpace('courier-parcels')
    logger(`Got Courier Space…`)
    const inbox = await space.joinThread(`thread-${guid}`)
    logger(`Got ${guid} Thread…`)
    const limit = 10
    const posts = await inbox.getPosts({ limit })
    logger(`Got ${posts.length} Entr${posts.length === 1 ? 'y' : 'ies'}…`)
    setLoading(false)
  }, [])

  useEffect(() => { checkForParcel(props.match.params.guid) }, [])

  return (
    <Flex alignItems='center' flexDirection='column'>
      <Heading>Package Viewer</Heading>
      <Heading>{props.match.params.guid}</Heading>

      {loading && <Loader/>}

      <ul>
        {log.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </Flex>
  )
}