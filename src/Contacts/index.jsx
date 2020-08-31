import React, { useState, useRef } from 'react'
import { Flex, Heading, Text, Button, Icon, Input, ToastMessage } from 'rimble-ui'
import { HashLink as Link } from 'react-router-hash-link'

export default () => {
  const [pubkey, setPubKey] = useState()
  const [name, setName] = useState('')
  const url = useRef(null)
  const toast = useRef(null)

  const getPubKey = async () => {
    try {
      const accounts = (
        await window.ethereum.request({ method: 'eth_requestAccounts' })
      )
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
          value={name} onChange={(evt) => setName(evt.target.value)}
        />
        <Button onClick={getPubKey}>Generate</Button>
      </>
    } else {
      const path = `/contacts/new?key=${pubkey}&alias=${encodeURI(name)}`
      const absolute = `https://pkg.dhappy.org/#${path}`
      return (
        <Flex alignItems='center' alignItems='center' flexDirection='row'>
          <Link to={path} ref={url} px='10'>{absolute}</Link>
          <Text> </Text>
          <Button onClick={copyKey} title='Copy to Clipboard'><Icon name='Assignment'/></Button>
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