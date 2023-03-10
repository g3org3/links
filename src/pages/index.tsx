import { type NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { FormEventHandler, useState } from 'react'
import { useRef } from 'react'

import { trpc } from '../utils/trpc'

const cs = (obj: Array<string>): string => obj.join(' ')

const Loading = () => (
  <a
    className={cs([
      'bg-slate-200',
      'flex-col',
      'flex',
      'group',
      'h-60',
      'items-center',
      'md:max-w-sm',
      'p-2',
      'rounded-lg',
      'shadow-lg',
      'w-full',
      'hover:bg-slate-50',
      'transition-colors',
      'duration-300',
    ])}
    target="_blank"
    rel="noreferrer"
  >
    <div className={cs(['animate-pulse', 'w-40', 'h-36', 'rounded-lg', 'bg-slate-400'])} />
    <div className="m-2 w-full animate-pulse bg-slate-400 font-semibold text-slate-400 line-clamp-2">
      text
    </div>
    <div className="animate-pluse m-1 w-full bg-gray-400  text-xs text-gray-400">url</div>
  </a>
)

const Home: NextPage = () => {
  const [search, setSearch] = useState('')
  const { data, isLoading } = trpc.example.links.useQuery()
  const utils = trpc.useContext()
  const inputRef = useRef<HTMLInputElement>(null)
  const addLink = trpc.example.addLink.useMutation({
    onSuccess() {
      if (inputRef.current?.value) {
        inputRef.current.value = ''
      }
      utils.example.links.invalidate()
    },
    onError(err) {
      console.log(err)
    },
  })

  const onAddLink: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (!inputRef.current?.value) {
      setSearch('')

      return
    }

    const { value } = inputRef.current
    if (value.includes('http')) {
      addLink.mutate({ url: value })
    } else {
      setSearch(value)
    }
  }

  const filteredLinks =
    data?.filter(
      (link) => !search || link.url.includes(search) || link.desc?.toLowerCase().includes(search)
    ) || []

  return (
    <>
      <Head>
        <title>Links</title>
        <meta name="description" content="Generated by create-t3-app" />
        <meta name="theme-color" content="rgb(203, 213, 225)" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen flex-col gap-4 bg-slate-300 p-4">
        <form onSubmit={onAddLink}>
          <div className="flex">
            <input
              disabled={addLink.isLoading}
              ref={inputRef}
              className="w-full rounded-lg p-2 focus:shadow-md"
              placeholder="http..."
            />
            <button type="submit" className="hidden bg-blue-300 p-2">
              add
            </button>
          </div>
        </form>
        <div className="flex flex-1 flex-wrap items-start justify-around gap-4 overflow-auto">
          {addLink.isLoading && <Loading />}
          {isLoading && [1, 2, 3, 4, 5, 6, 7, 8].map((x) => <Loading key={x} />)}
          {filteredLinks.map((link) => (
            <a
              key={link.url}
              className={cs([
                'bg-slate-200',
                'flex-col',
                'flex',
                'group',
                'h-60',
                'items-center',
                'md:max-w-sm',
                'p-2',
                'rounded-lg',
                'shadow-lg',
                'w-full',
                'hover:bg-slate-50',
                'transition-colors',
                'duration-300',
              ])}
              target="_blank"
              href={link.url}
              rel="noreferrer"
            >
              <img alt="logo" className={cs(['h-36', 'rounded-lg'])} src={link.image} />
              <div className="font-semibold text-slate-700 line-clamp-2">{link.desc}</div>
              <div className="flex-1"></div>
              <div className="font-mono text-xs text-gray-400">{link.url}</div>
            </a>
          ))}
        </div>
      </main>
    </>
  )
}

export default Home
