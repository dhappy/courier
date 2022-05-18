import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

export const Courier = ({ Component, pageProps }: AppProps) => (
  <ChakraProvider>
    <Component {...pageProps}/>
  </ChakraProvider>
)

export default Courier
