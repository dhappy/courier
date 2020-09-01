import React, { useState, useEffect, useCallback } from 'react'
import { Heading, Button, Input, Card, Loader } from 'rimble-ui'
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

  const load3Box = useCallback(async () => {
    const user = (
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    )[0]
    setBox(await Box.openBox(user, Web3.givenProvider))
  }, [])

  useEffect(() => { load3Box() }, [load3Box])

  const updateBoxProfile = useCallback(async () => {
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
  }, [])

  useEffect(() => { loadContacts() }, [loadContacts, box])

  const saveContact = async () => {
    if(!contacts) {
      console.error("Contact space isn't set")
    } else {
      setSaveText(<Loader color='white'/>)
      await contacts.private.set(addr, {
        key: key,
        names: [...new Set(names.filter(n => n.trim() !== ''))],
      })
      setSaveText('Done')
    }
  }

  return (
    <Card width='50%' margin='auto'>
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