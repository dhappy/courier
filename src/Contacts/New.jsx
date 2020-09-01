import React, { useState, useRef, useEffect } from 'react'
import { Flex, Heading, Text, Button, Icon, Input, Card, Loader } from 'rimble-ui'
import { HashLink as Link } from 'react-router-hash-link'
import { useLocation, Redirect } from 'react-router-dom'
import Box from '3box'
import Web3 from 'web3'

const useQuery = () => new URLSearchParams(useLocation().search)

export default () => {
  const query = useQuery()
  const [names, setNames] = useState([query.get('alias')])
  const [addr] = useState(query.get('address'))
  const [key] = useState(query.get('key'))
  const [contacts, setContacts] = useState()
  const [box, setBox] = useState()
  const [boxProfile, setBoxProfile] = useState(
    <Loader display='inline' title='Opening 3Box…'/>
  )
  const [saveText, setSaveText] = useState('Save')

  const load3Box = async () => {
    const user = (
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    )[0]
    setBox(await Box.openBox(user, Web3.givenProvider))
  }

  useEffect(() => { load3Box() }, [])

  const updateBoxProfile = async () => {
    setBoxProfile(<Loader color='orange' display='inline' title='Getting 3Box Profile…'/>)
    const profile = await Box.getProfile(addr)
    setBoxProfile(
      (!profile || Object.keys(profile).length === 0)
      ? <i>Empty</i>
      : (
        <ul>
          {Object.entries(profile)
          .filter(([key, val]) => !key.startsWith('proof_') && typeof(val) !== 'object')
          .map(([key, val]) => (
            <li key={key}><b>{key}:</b> {val}</li>
          ))}
        </ul>
      )
    )
  }

  useEffect(() => { updateBoxProfile() }, [])

  const loadContacts = async () => {
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
  }

  useEffect(() => { loadContacts() }, [box])

  const saveContact = async () => {
    setSaveText(<Loader color='white'/>)
    await contacts.private.set(addr, {
      names: [...new Set(names)], key: key
    })
    setSaveText('Done')
  }

  return (
    <Card width='50%' margin='auto'>
      <Heading>Create a New Contact</Heading>
      
      <ul>
        <li>
          <b>Names:</b>
          <ul>
            {names.map((name, idx) => (
              <li>
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
                <Button title='Delete' mx={2} variant='danger'
                  onClick={() => setNames(names => {
                    if(names.length === 1) {
                      return ['']
                    } else {
                      return [...names.slice(0, idx), ...names.slice(idx + 1)]
                    }
                  })}
                >❌</Button>
                <Button title='Add'
                  onClick={() => setNames(names => {
                    return [...names.slice(0, idx + 1), '', ...names.slice(idx + 1)]
                  })}
                >➕</Button>
              </li>
            ))}
          </ul>
        </li>
        <li><b>Public Key:</b> {key}</li>
        <li><b>ETH Address:</b> {addr}</li>
        <li><b>3Box Profile:</b> {boxProfile}</li>
      </ul>

      <Link to='/contacts' style={{marginLeft: '50%'}}>
        <Button.Outline mx={2}>Cancel</Button.Outline>
      </Link>
      <Button onClick={saveContact} variant='success  '
        disabled={
          names.filter(n => n !== '').length === 0
          || saveText !== 'Save'
        }
      >{saveText}</Button>
      {saveText === 'Done' && <Redirect to='/contacts'/>}
    </Card>
  )
}