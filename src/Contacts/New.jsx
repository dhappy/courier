import React, { useState, useEffect, useCallback } from 'react'
import { Heading, Button, Input, Card, Loader, Flex } from 'rimble-ui'
import { HashLink as Link } from 'react-router-hash-link'
import { useLocation, Redirect } from 'react-router-dom'
import Box from '3box'
import Web3 from 'web3'

const useQuery = () => new URLSearchParams(useLocation().search)

export default () => {
  const query = useQuery()
  const [names, setNames] = useState([query.get('alias')])
  const [addr] = useState(query.get('address'))
  const [did, setDID] = useState()
  const [contacts, setContacts] = useState()
  const [box, setBox] = useState()
  const [boxProfile, setBoxProfile] = useState(
    <Loader display='inline' title='Opening 3Box…'/>
  )
  const [saveText, setSaveText] = useState('Save')

  let provider = Web3.givenProvider
  if(!provider) {
    provider = window.web3 && window.web3.currentProvider
  }
  const web3 = new Web3(provider)

  const load3Box = useCallback(async () => {
    try {
      const user = (await web3.eth.getAccounts())[0]
      const box = await Box.openBox(user, web3.currentProvider)
      setBox(box)
    } catch(err) {
      alert(err.message)
    }
  }, [])

  useEffect(() => { load3Box() }, [load3Box])

  const updateBoxProfile = useCallback(async () => {
    try {
      setBoxProfile(<Loader color='orange' display='inline' title='Getting 3Box Profile…'/>)
      const profile = await Box.getProfile(addr)
      const entries = Object.entries(profile || {}).filter(
        ([key, val]) => !key.startsWith('proof_') && typeof(val) !== 'object'
      )
      setBoxProfile(
        (entries.length === 0)
        ? <ul><li><i>Empty</i></li></ul>
        : (
          <ul>
            {entries
              .map(([key, val]) => (
                <li key={key}><b>{key}:</b> {JSON.stringify(val)}</li>
              ))
            }
          </ul>
        )
      )
      console.info(provider, web3.currentProvider)
      console.info('DID', (await Box.openBox(addr, web3.currentProvider)).DID)
      setDID((await Box.openBox(addr, web3.currentProvider)).DID)
    } catch(err) {
      alert(err.message)
    }
  }, [addr])

  useEffect(() => { updateBoxProfile() }, [updateBoxProfile])

  const loadContacts = useCallback(async () => {
    if(box) {
      const contacts = await box.openSpace('courier-contacts')
      await contacts.syncDone
      setContacts(contacts)

      const existing = await contacts.private.get(addr)
      if(existing) {
        setNames(names => [...(new Set(
          [...names, ...existing.names]
        ))])
      }
    }
  }, [box])

  useEffect(() => { loadContacts() }, [loadContacts])

  const saveContact = async () => {
    if(!contacts) {
      console.error("Contact space isn't set")
    } else {
      setSaveText(<Loader color='white'/>)
      const entry = {
        did, address: addr,
        names: [...new Set(names.filter(n => n.trim() !== ''))],
      }
      await contacts.private.set(addr, entry)
      await contacts.private.set(did, entry)
      setSaveText(<Loader color='green'/>)

      // Before a thread can be opened, the space it belongs to
      // has to have been opened by the specific user
      const other = await Box.openBox(addr, Web3.givenProvider)
      const parcels = await box.openSpace('courier-parcels')
      await parcels.syncDone
      setSaveText('Done')
    }
  }

  return (
    <Flex flexDirection='column'><Card>
      <Heading>Create a New Contact</Heading>
      
      <ul>
        <li>
          <b>Names:</b>
          <ul>
            {names.map((name, idx) => (
              <li key={idx}>
                <Input ml={2} value={name} my={2}
                  onChange={(evt) => {
                    const newName = evt.target.value
                    setNames(
                      (names) => [
                        ...names.slice(0, idx),
                        newName,
                        ...names.slice(idx + 1)
                      ]
                    )
                  }}
                />
                <Button title='Delete' mx={2} variant='danger' icon='Delete'
                  onClick={() => setNames(names => {
                    if(names.length === 1) {
                      return ['']
                    } else {
                      return [...names.slice(0, idx), ...names.slice(idx + 1)]
                    }
                  })}
                />
                <Button title='Add' icon='Add'
                  onClick={() => setNames(names => {
                    return [...names.slice(0, idx + 1), '', ...names.slice(idx + 1)]
                  })}
                />
              </li>
            ))}
          </ul>
        </li>
        <li><Flex flexDirection='row'>
          <b style={{marginRight: '0.5em'}}>Decentralized ID:</b> {did ? did : <Loader/>}
        </Flex></li>
        <li><b>ETH Address:</b> {addr}</li>
        <li>
          <Flex flexDirection='row'>
            <b>3Box Profile:</b> {!boxProfile && <Loader/>}
          </Flex>
          {boxProfile}
        </li>
      </ul>

      <Flex justifyContent='flex-end'>
        <Link to='/contacts'>
          <Button.Outline mx={2}>Cancel</Button.Outline>
        </Link>
        <Button onClick={saveContact} variant='success  '
          disabled={
            names.filter(n => n !== '').length === 0
            || saveText !== 'Save'
          }
        >{saveText}</Button>
        {saveText === 'Done' && <Redirect to='/contacts'/>}
      </Flex>
    </Card></Flex>
  )
}