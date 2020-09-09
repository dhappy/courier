import React, { useState, useEffect, useCallback } from 'react'
import Box from '3box'
import { Loader, Flex, Heading } from 'rimble-ui'
import Web3 from 'web3'

export default () => {
  const [status, setStatus] = useState({
    text: 'Initializing…', color: 'blue'
  })
  const updateStatus = (text, color) => (
    setStatus({ text, color })
  )

  const watchForJobs = useCallback(async () => {
    const user = (
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    )[0]
    updateStatus(`Got Address: ${user}`, 'orange')
    const box = await Box.openBox(user, Web3.givenProvider)
    updateStatus(`Got 3Box…`, 'green')
    const space = await box.openSpace('courier')
    updateStatus(`Got Courier Space…`, 'blue')
    const inbox = await space.joinThread('inbox')
    updateStatus(`Got Inbox Thread…`, 'red')
    const limit = 20
    const posts = await inbox.getPosts({ limit })
    updateStatus(`Got ${posts.length} Entr${posts.length === 1 ? 'y' : 'ies'}…`, 'blue')

    for(let post of posts) {
      switch(post.type) {
        case 'contract':
        if(post.bidding.expires >= new Date()) {
          const box = await Box.openBox(post.owner.address, Web3.givenProvider)
          updateStatus(`Got 3Box`, 'green')
          const space = await box.openSpace('courier-contracts')
          updateStatus(`Got Contracts Space…`, 'blue')
          const contract = await space.joinThreadByAddress(post.address)
          const limit = 20
          const posts = await inbox.getPosts({ limit })
          updateStatus(`Got ${posts.length} Entr${posts.length === 1 ? 'y' : 'ies'}…`, 'blue')
          console.info('EXP', post)
        } else {
          console.info('TRCT', post)
        }
        break
        default:
          console.info('UNKNWN')
        break
      }
    }
    updateStatus('Done')    
  }, [])

  useEffect(() => { watchForJobs() }, [watchForJobs])

  return (
    <Flex alignItems='center' flexDirection='column'>
      <Heading>Private Jobs</Heading>
      {status &&
        <Flex alignItems='center' flexDirection='column'>
          <Heading>{status.text}</Heading>
          {status.color && <Loader color={status.color}/>}
        </Flex>
      }
    </Flex>
  )
}