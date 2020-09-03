import React, { useEffect, useState, useCallback } from 'react'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import ConnectionBanner from '@rimble/connection-banner'
import { MetaMaskButton, Card, Flex } from 'rimble-ui'
import Web3 from 'web3'
import './App.css'
import Main from './Main'
import Jobs from './Jobs'
import Parcels from './Parcels'
import ViewParcel from './Parcels/View'
import Ship from './Ship'
import Join from './Join'
import Find from './Find'
import Contacts from './Contacts'
import NewContact from './Contacts/New'
import EditContact from './Contacts/Edit'

export default () => {
  const [currentNet, setCurrentNet] = useState()
  const web3 = new Web3(Web3.givenProvider)

  const setNet = useCallback(async () => {
    try {
     setCurrentNet(await web3.eth.net.getId())
    } catch(err) {
      console.error('App#setNet', err)
    }
  }, [web3.eth.net])

  useEffect(() => { setNet() }, [setNet])

  const mobile = (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
    .test(navigator.userAgent)
  )

  return (
    <Router>
      <ConnectionBanner currentNetwork={currentNet} requiredNetwork={4}>
        {{
          notWeb3CapableBrowserMessage: (
            <Card maxWidth='25em' mx='auto' marginTop='1.5em'>
              <Flex alignItems='center' flexDirection='column'>
                <MetaMaskButton
                  as='a' href='//metamask.app.link/dapp/pkg.dhappy.org'
                  mx='auto'
                >
                  {mobile ? 'Launch in MetaMask' : 'Get Metamask'}
                </MetaMaskButton>
              </Flex>
            </Card>
          ),
          noNetworkAvailableMessage: (
            <Card maxWidth='25em' mx='auto' marginTop='1.5em'>
              <Flex alignItems='center' flexDirection='column'>
                <MetaMaskButton
                  as='a' href='//metamask.io/download.html'
                  mx='auto'
                >
                  {mobile ? 'Launch in MetaMask' : 'Get Metamask'}
                </MetaMaskButton>
              </Flex>
            </Card>
          ),
        }}
      </ConnectionBanner>
      <Switch>
        <Route path='/' exact component={Main}/>
        <Route path='/contacts/:address/edit' component={EditContact}/>
        <Route path='/contacts/new' component={NewContact}/>
        <Route path='/contacts' component={Contacts}/>
        <Route path='/jobs' component={Jobs}/>
        <Route path='/cel/:guid' component={ViewParcel}/>
        <Route path='/view/:guid' component={ViewParcel}/>
        <Route path='/parcels' component={Parcels}/>
        <Route path='/ship' component={Ship} />
        <Route path='/contract/join' compoenent={Find} />
        <Route path='/contracts/:id/join' component={Join} />
      </Switch>
    </Router>
  )
}