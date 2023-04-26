import { type AppType } from 'next/app'
import Script from 'next/script'

import { trpc } from '../utils/trpc'

import '../styles/globals.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  const text =
    "window.plausible = window.plausible || function(){' '}" +
    '\n' +
    '{(window.plausible.q = window.plausible.q || []).push(arguments)}'

  return (
    <>
      <Script
        defer
        data-domain="links.jorgeadolfo.com"
        src="https://plausible.io/js/script.tagged-events.js"
      />
      <Script id="plausible">{text}</Script>
      <Component {...pageProps} />
    </>
  )
}

export default trpc.withTRPC(MyApp)
