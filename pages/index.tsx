import { Container, Link as ChakraLink, Stack } from '@chakra-ui/react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import NextLink from 'next/link'

const Home: NextPage = () => (
  <Stack align="center">
    <Head>
      <title>Courier</title>
      <meta name="description" content="Delivery coordination" />
    </Head>

    <NextLink href="/labels">
      <ChakraLink
        bg="green"
        px={5} px={2}
        mt={100}
      >
        Print Labels
      </ChakraLink>
    </NextLink>

  </Stack>
)

export default Home
