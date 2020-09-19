import React, { useState, useEffect } from "react";
import Web3 from 'web3'
import Box from '3box'

export default function App() {
  const [lines, setLines] = useState([])
  const log = (msg) => setLines(ls => [...ls, msg])
  const [posts, setPosts] = useState()

  const post = async () => {
    try {
      let provider = Web3.givenProvider
      if(!provider) {
        provider = window.web3 && window.web3.currentProvider
      }
      if(!provider) {
        throw new Error("Couldn't Find an Ethereum Provider.\n\nCan't connect to databases.")
      }
      const web3 = new Web3(provider)
      log(`Getting Address…`)
      const user = (await web3.eth.getAccounts())[0]
      log(`Opening 3Box: ${user}…`)
      const box = await Box.openBox(user, provider)
      log(`Got 3Box…`)
      const did = await box.DID
      log(`Got DID: ${did}…`)
      const query  = (
        `{ profile(id: "${user}") { did } }`
      )
      // const profiles = (await Box.profileGraphQL(query)).profile.did
      // const did2 = await box.DID
      // log(`Got DID2: ${did2}…`)
      const space = await box.openSpace('testing')
      log(`Got Testing Space…`)
      const did2 = await space.DID
      log(`Got DID: ${did2}…`)
      const inbox = await space.joinThread('inbox')
      log(`Waiting on Sync…`)
      await inbox.syncWait
      log(`Got Inbox Thread…`)
      await inbox.post({ creator: did, creator2: did2 })
      log('Posted…')
      const posts = await inbox.getPosts()
      log(`Got ${posts.length} Post${post.length === 1 ? '' : 's'}…`)
      setPosts(posts)
    } catch(err) {
      alert(err.message)
    }
  }

  useEffect(() => { post() }, [])

  return (
    <div className="App">
      {posts && <ul>
        {posts.map(p => <li>{p.author} === {p.message.creator2}</li>)}
      </ul>}
      <ul>{lines.map(l => <li>{l}</li>)}</ul>
    </div>
  )
}
