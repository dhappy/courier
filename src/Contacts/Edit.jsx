import React, { useState, useEffect, useCallback } from 'react'
import { Flex, Heading, Button, Input, Card, Loader } from 'rimble-ui'
import { HashLink as Link } from 'react-router-hash-link'
import { Redirect } from 'react-router-dom'
import Box from '3box'
import Web3 from 'web3'

export default (props) => {
  const [names, setNames] = useState()
  const [addr] = useState(props.match.params.address)
  const [key, setKey] = useState()
  const [contacts, setContacts] = useState()
  const [box, setBox] = useState()
  const [imageCID, setImageCID] = useState()
  const [boxLoader, setBoxLoader] = useState(
    <Loader display='inline' title='Opening 3Box…'/>
  )
  const [boxProfile, setBoxProfile] = useState()
  const [saveText, setSaveText] = useState('Save')

  const load3Box = async () => {
    const user = (
      await window.ethereum.request({ method: 'eth_requestAccounts' })
    )[0]
    setBox(await Box.openBox(user, Web3.givenProvider))
  }

  useEffect(() => { load3Box() }, [])

  const linkLink = (txt) => {
    if(/^https?:\/\//.test(txt)) {
      return <a href={txt}>{txt}</a>
    } else {
      return txt
    }
  }

  const updateBoxProfile = useCallback(async () => {
    setBoxLoader(<Loader color='orange' display='inline' title='Getting 3Box Profile…'/>)
    const profile = await Box.getProfile(addr)
    if(profile.image && profile.image.length > 0) {
      setImageCID(profile.image[0].contentUrl['/'])
    }
    setBoxProfile(
      (!profile || Object.keys(profile).length === 0)
      ? <i>Empty</i>
      : (
        <ul>
          {Object.entries(profile)
          .filter(([key, val]) => !key.startsWith('proof_') && typeof(val) !== 'object')
          .map(([key, val]) => (
            <li key={key}><b>{key}:</b> {linkLink(val)}</li>
          ))}
        </ul>
      )
    )
  }, [])

  useEffect(() => { updateBoxProfile() }, [updateBoxProfile])

  const loadContacts = async () => {
    if(box) {
      const contacts = await box.openSpace('courier-contacts')
      await contacts.syncDone
      setContacts(contacts)

      const existing = await contacts.private.get(addr)
      if(existing) {
        setNames(names => [...(new Set(
          [...(names || []), ...existing.names]
        ))])
        setKey(existing.key)
      } else {
        alert(`Contact ${addr} Not Found`)
      }
    }
  }

  useEffect(() => { loadContacts() }, [box])

  const saveContact = async () => {
    setSaveText(<Loader color='white'/>)
    await contacts.private.set(addr, {
      key: key,
      names: [...new Set(names.filter(n => n.trim() !== ''))],
    })
    setSaveText('Done')
  }

  return (
    <Card width='50%' margin='auto'>
      <Flex flexDirection='row' alignItems='center'>
        {imageCID && <img className='avatar' src={`//ipfs.io/ipfs/${imageCID}`}/>}
        <Heading ml={15}>Edit a Contact</Heading>
      </Flex>

      <ul>
        <li>
          <Flex flexDirection='row'>
            <b>Names:</b>
            {!names && <Loader title='Loading from 3Box…' mx={2}/>}
          </Flex>
          {names &&
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
          }
        </li>
        <li><b>Public Key:</b> {key}</li>
        <li><b>ETH Address:</b> {addr}</li>
        <li>
          <Flex flexDirection='row'>
            <b>3Box Profile:</b> {!boxProfile && boxLoader}
          </Flex>
          {boxProfile}
        </li>
      </ul>

      <Flex justifyContent='flex-end'>
        <Link to='/contacts' style={{marginLeft: '50%'}}>
          <Button.Outline mx={2}>Cancel</Button.Outline>
        </Link>
        <Button onClick={saveContact} variant='success  '
          disabled={
            (names || []).filter(n => n !== '').length === 0
            || saveText !== 'Save'
          }
        >{saveText}</Button>
        {saveText === 'Done' && <Redirect to='/contacts'/>}
      </Flex>
    </Card>
  )
}