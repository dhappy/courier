import React, { useState, useRef } from 'react'
import { Flex, Heading, Text, Button, Icon, Input, ToastMessage } from 'rimble-ui'
import { HashLink as Link } from 'react-router-hash-link'

export default () => {
  const [pubkey, setPubKey] = useState()
  const [name, setName] = useState('')
  const [addr, setAddr] = useState()
  const url = useRef(null)
  const toast = useRef(null)

  const getPubKey = async () => {
    try {
      const accounts = (
        await window.ethereum.request({ method: 'eth_requestAccounts' })
      )
      setAddr(accounts[0])
      setPubKey(await window.ethereum.request({
        jsonrpc: '2.0',
        method: 'eth_getEncryptionPublicKey',
        params: [accounts[0]],
        from: accounts[0],
      }))
    } catch(err) {
      alert(err.message)
    }
  }

  const copyKey = () => {
    try {
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(url.current)
      selection.removeAllRanges()
      selection.addRange(range)
      document.execCommand('copy')
      selection.removeAllRanges()

      toast.current.addMessage('Copied to Clipboard', {
        secondaryMessage: 'URL is ready to paste…',
        variant: 'default',
        icon: 'Assignment',
      })
    } catch(err) {
      alert(err.message)
    }
  }

  const keylink = () => {
    if(!pubkey) {
      return <>
        <Input placeholder='What do they call you?'
          value={name} onChange={evt => setName(evt.target.value)}
          onKeyDown={evt => { if(evt.key.toLowerCase() === 'enter') { getPubKey() } else { console.info(evt.key) } }}
        />
        <Button onClick={getPubKey}>Generate</Button>
      </>
    } else {
      const path = `/contacts/new?key=${pubkey}&alias=${encodeURI(name)}&address=${addr}`
      const absolute = `https://pkg.dhappy.org/#${path}`
      return (
        <Flex alignItems='center' justifyContent='center' flexDirection='row'>
          <Link to={path} ref={url}>{absolute}</Link>
          <Button onClick={copyKey} title='Copy to Clipboard' mx={2} size='small'>
            <Icon name='Assignment'/>
          </Button>
        </Flex>
      )
    }
  }

  return (
    <Flex alignItems='center' flexDirection='column'>
      <Heading>Contacts</Heading>
      <Text>To invite contacts, send them this invitation link: {keylink()}</Text>
      <ToastMessage.Provider ref={toast}/>
    </Flex>
  )
}