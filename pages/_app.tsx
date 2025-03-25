import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export const Courier = ({ Component, pageProps }: AppProps) => (
  <ChakraProvider>
    <Head>
      <link rel="shortcut icon" href="/envelope-192.png" />
    </Head>

    <Component {...pageProps}/>
  </ChakraProvider>
)

export default Courier
