import React, { useState, useRef, useEffect } from 'react'
import {
  Box as LayoutBox, Flex, Heading, Text,
  Button, Icon, Input, ToastMessage,
  Modal, Card, Table, Loader
} from 'rimble-ui'
import { HashLink as Link } from 'react-router-hash-link'
import Box from '3box'
import Web3 from 'web3'
import { commafy } from '../utils'

export default () => {
  const [pubkey, setPubKey] = useState()
  const [name, setName] = useState('')
  const [addr, setAddr] = useState()
  const [box, setBox] = useState()
  const [info, setInfo] = useState()
  const [contacts, setContacts] = useState()
  const [modalOpen, setModalOpen] = useState(false)
  const url = useRef(null)
  const toast = useRef(null)

  const load3Box = async () => {
    try {
      let provider = Web3.givenProvider
      if(!provider) {
        provider = window.web3 && window.web3.currentProvider
      }
      if(!provider) {
        throw new Error("Couldn't Find an Ethereum Provider.\n\nCan't connect to databases.")
      }
      const web3 = new Web3(provider)
      const user = (await web3.eth.getAccounts())[0]
      setAddr(user)
      setBox(await Box.openBox(user, web3.currentProvider))
    } catch(err) {
      alert(err.message)
    }
  }

  useEffect(() => { load3Box() }, [])

  const loadContacts = async () => {
    if(box) {
      const contacts = await box.openSpace('courier-contacts')
      await contacts.syncDone
      setContacts(contacts)
      const info = await contacts.private.all()
      setInfo(info)
      const keys = `[${Object.keys(info).map(k => `"${k}"`).join(',')}]`
      const query = (
        `{ profiles(ids: ${keys}) { name eth_address image } }`
      )
      const profiles = (await Box.profileGraphQL(query)).profiles
      setInfo((info) => {
        let cp = {...info}
        for(let profile of profiles) {
          cp[profile.eth_address].image = profile.image
          cp[profile.eth_address].name3 = profile.name
        }
        return cp
      })
    }
  }

  useEffect(() => { loadContacts() }, [box])

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
    const path = `/ppl/new?alias=${encodeURI(name)}&address=${addr}`
    const absolute = `https://pkg.dhappy.org/#${path}`

    return <>
      <Input placeholder='What do they call you?'
        value={name} onChange={evt => setName(evt.target.value)}
      />
      {name && <>
        <Text>To invite contacts, send them this:</Text>
        <Flex alignItems='center' justifyContent='center' flexDirection='row'>
          <Link to={path} ref={url} style={{overflow: 'hidden', textOverflow: 'ellipsis' }}>{absolute}</Link>
          <Button onClick={copyKey} title='Copy to Clipboard' mx={2} size='small'>
            <Icon name='Assignment'/>
          </Button>
        </Flex>
      </>}
    </>
  }

  return (
    <Flex alignItems='center' flexDirection='column' position='relative'>
      <Heading>Contacts</Heading>

      <Button onClick={() => setModalOpen(true)} icon='Share'
        position='absolute' top={0} right={0} mt={3} mr={3}
        title='Invite Contacts'
      />
      <Modal isOpen={modalOpen}>
        <Card p={0}>
          <Button.Text icononly icon='Close' color='moon-gray'
            position='absolute' top={0} right={0} mt={3} mr={3}
            onClick={() => setModalOpen(false)} title='Close'
          />

          <LayoutBox p={4} mb={3}>
            <Heading>Invitation Link</Heading>
            {keylink()}
          </LayoutBox>

          <Flex px={4} py={3} borderTop={1}
            borderColor='#E8E8E8' justifyContent='flex-end'
          >
            <Button onClick={() => { setPubKey(); setModalOpen(false) }}
            >Done</Button>
          </Flex>
        </Card>
      </Modal>

      {!info
        ? (
          <Card><Flex alignItems='center' flexDirection='column'>
            <Text>Loading Contacts</Text><Loader size='large' mt={3}/>
          </Flex></Card>
        )
        : (Object.keys(info).length === 0
          ? <Heading>No Contacts</Heading>
          : (
            <Table>
              <thead><tr>
                <th>Avatar</th><th>Names</th><th>3Box Name</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {Object.entries(info).map(([addr, info]) => (
                  <tr key={addr}>
                    <td>{info.image && <img className='avatar' src={`//ipfs.io/ipfs/${info.image}`}/>}</td>
                    <td title={`Public Key: ${info.key}`}>{commafy(info.names)}</td>
                    <td><a href={`//3box.io/${addr}`} target='_blank' title='3Box Profile'>{info.name3}</a></td>
                    <td>
                      <Link to={`/contacts/${addr}/edit`}>
                        <Button icon='Edit' mx={1}>Edit</Button>
                      </Link>
                      <Button variant='danger' icon='Delete' mx={1}
                        onClick={() => {
                          if(window.confirm(`Really Delete: ${commafy(info.names)}?`)) {
                            contacts.private.remove(addr)
                            setInfo(info => {
                              const cp = {...info}
                              delete(cp[addr])
                              return cp
                            })
                          }
                        }}
                      >Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )
        )
      }
      <ToastMessage.Provider ref={toast}/>
    </Flex>
  )
}