import React, { useState, useEffect, useCallback } from 'react'
import Box from '3box'
import { Loader, Flex, Heading, Card } from 'rimble-ui'
import Web3 from 'web3'
import IdentityWallet from 'identity-wallet'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import { Resolver } from 'did-resolver'
import { follow } from '../MultiThread'

export default () => {
  const [status, setStatus] = useState({
    text: 'Initializing…', color: 'blue'
  })
  const [cards, setCards] = useState([])
  const updateStatus = (text, color) => (
    setStatus({ text, color })
  )

  const watchForJobs = useCallback(async () => {
    try {
      let provider = Web3.givenProvider
      if(!provider) {
        provider = window.web3 && window.web3.currentProvider
      }
      if(!provider) {
        throw new Error("Couldn't Find an Ethereum Provider.\n\nCan't connect to databases.")
      }
      const web3 = new Web3(provider)
      console.info('ACCT', web3.eth.accounts.create())
      updateStatus(`Getting Address…`, 'pink')
      const user = (await web3.eth.getAccounts())[0]
      updateStatus(`Opening 3Box: ${user}…`, 'orange')
      const box = await Box.openBox(user, provider)
      updateStatus(`Got 3Box…`, 'green')
      const space = await box.openSpace('courier')
      updateStatus(`Got Courier Space…`, 'blue')
      const inbox = await space.joinThread('inbox')
      updateStatus(`Got Inbox Thread…`, 'red')
      const limit = 20
      const posts = await inbox.getPosts({ limit })
      updateStatus(`Got ${posts.length} Entr${posts.length === 1 ? 'y' : 'ies'}…`, 'blue')

      //for(let { postId: id } of posts) inbox.deletePost(id)

      // const getConsent = async ({ type, origin, spaces }) => {
      //   // For testing purposes a function that just returns
      //   // true can be used. In prodicution systems the user
      //   // should be prompted for input.
      //   return true
      // }
      // const wallet = new IdentityWallet(getConsent, { ethereumAddress: user })
      // console.info('MSG', await wallet.encrypt("message", 'courier'))

      for(let { message, author, timestamp, postId: id } of posts) {
        if(message.awaiting) {
          const config = await Box.getConfig(author)
          updateStatus(`Getting 3Box…`, 'green')
          const box = await Box.openBox(config.links[0].address, provider)
          updateStatus(`Got 3Box.`, 'green')
          const space = await box.openSpace('courier')
          updateStatus(`Got Parcels Space…`, 'blue')
          const docs = await follow(message.awaiting, { space, onUpdate: () => {
            console.info('UPDT')
          } })
          const count = Object.keys(docs).length
          updateStatus(`Got ${count} Author${count === 1 ? '' : 's'}…`, 'blue')
          setCards(cs => [docs, ...cs])
          console.info(await box._3id.signJWT(
            { payload: 'test' }, { space: 'courier'  }
          ))
        } else if(message.contract) {
          console.info('CTCT', message)
        } else {
          console.error('Unknown Inbox Post Type', message)
        }
      }
    } catch(err) {
      console.error(err)
      alert(err.message)
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
      {cards.map((c, i) => (
        <Card key={i}>{JSON.stringify(c)}</Card>
      ))}
    </Flex>
  )
}