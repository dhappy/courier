import React, { useState } from 'react'
import { MetaMaskButton, Button, Card, Box, Flex } from "rimble-ui"
//import Web3 from 'web3'
import { Link } from 'react-router-dom'
import './App.css'

export default () => {
  const [addr, setAddr] = useState()
  //const web3 = new Web3(Web3.givenProvider);

  const mobile = (
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
    .test(navigator.userAgent)
  )
  const connect = async () => {
    if(window.ethereum) {
      const addrs = (
        await window.ethereum.request({ method: 'eth_requestAccounts' })
      )
      if(addrs.length >= 1) {
        setAddr(addrs[0])
      }
    }
  }

  return (
    <Card width='auto' maxWidth='25em' mx='auto' px={[3, 3, 4]}>
      <Flex alignItems={"center"}>
        {addr
          ? <Box textAlign='center' width='100%'>
              <Flex justifyContent="space-between" alignItems="center" flexDirection="column">
                <Link to='/jobs'>
                  <Button mx='auto' my='0.5em'>Bid On Jobs</Button>
                </Link>
                <Link to='/pkg'>
                  <Button mx='auto' my='0.5em'>Investigate Packages</Button>
                </Link>
              </Flex>
            </Box>
          : (
            (window.ethereum
              ? (
                <MetaMaskButton onClick={connect} mx='auto' textAlign='center'>
                  Connect with MetaMask
                </MetaMaskButton>
              )
              : (
                (mobile
                  ? (
                    <MetaMaskButton
                    as='a' href='//metamask.app.link/dapp/pkg.dhappy.org' target='_blank'
                    title='Download MetaMask' mx='auto'
                    >
                      Launch in MetaMask
                    </MetaMaskButton>
                  )
                  : (
                    <MetaMaskButton
                      as='a' href='//metamask.io/download.html' target='_blank'
                      title='Download MetaMask' mx='auto'
                    >
                      Install MetaMask
                    </MetaMaskButton>
                  )
                )
              )
            )
          )
        }
      </Flex>
    </Card>
  )
}