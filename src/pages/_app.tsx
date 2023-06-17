import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type AppType } from 'next/app'
import Script from 'next/script'

import Layout from 'components/Layout'
import { trpc } from 'utils/trpc'

import '../styles/globals.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  const text = "window.plausible = window.plausible || function(){' '}" + '\n' // +
  // '{(window.plausible.q = window.plausible.q || []).push(arguments)}'

  return (
    <>
      <Script defer data-domain="links.jorgeadolfo.com" src="https://a.jorgeadolfo.com/script.js" />
      <Script id="plausible">{text}</Script>
      <ReactQueryDevtools initialIsOpen />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}

export default trpc.withTRPC(MyApp)
