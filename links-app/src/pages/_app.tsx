import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type AppType } from 'next/app'
import Script from 'next/script'

import Layout from 'components/Layout'
import { trpc } from 'utils/trpc'

import '../styles/globals.css'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Script
        defer
        src="https://api.jagc.app/script.js"
        data-website-id="aa4c4acb-3222-4b0a-955e-3698dc51faa2"
      />
      <Script
        defer
        src="https://api.jagc.app/recorder.js"
        data-website-id="aa4c4acb-3222-4b0a-955e-3698dc51faa2"
      />
      <ReactQueryDevtools initialIsOpen />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}

export default trpc.withTRPC(MyApp)
