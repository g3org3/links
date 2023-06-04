import { useIntersection } from '@mantine/hooks'
import { type NextPage } from 'next'
import Head from 'next/head'
import { FormEventHandler, useEffect, useState } from 'react'
import { useRef } from 'react'

import { trpc } from 'utils/trpc'
const clx = (cond: Record<string, boolean>, clss: string) => {
  return [clss].concat(Object.keys(cond).filter((key) => cond[key])).join(' ')
}

const Loading = ({ isFull }: { isFull?: boolean }) => (
  <a
    className={clx(
      { 'md:max-w-sm': !isFull },
      'group flex h-60 w-full flex-col items-center rounded-lg bg-slate-200 p-2 shadow-lg transition-colors duration-300 hover:bg-slate-50'
    )}
    target="_blank"
    rel="noreferrer"
  >
    <div className="h-36 w-40 animate-pulse rounded-lg bg-slate-400" />
    <div className="m-2 line-clamp-2 w-full animate-pulse bg-slate-400 font-semibold text-slate-400">
      text
    </div>
    <div className="animate-pluse m-1 w-full bg-gray-400  text-xs text-gray-400">url</div>
  </a>
)

const Home: NextPage = () => {
  const [search, setSearch] = useState('')
  const { data, isLoading, isFetchingNextPage, fetchNextPage } = trpc.example.linksp.useInfiniteQuery(
    { limit: 16 },
    {
      staleTime: 10 * 1000,
      getNextPageParam: (lastPage) => lastPage.page + 1,
    }
  )
  const utils = trpc.useContext()
  const inputRef = useRef<HTMLInputElement>(null)
  const lastPostRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  })

  const isEndReached = data?.pages && data?.pages[0]?.totalPages === data?.pages.length

  useEffect(() => {
    if (!isEndReached && entry?.isIntersecting) {
      fetchNextPage()
    }
  }, [entry?.isIntersecting])

  useEffect(() => {
    if (!isLoading && isFetchingNextPage && linksRef.current) {
      linksRef.current.scrollTop = linksRef.current.scrollHeight
    }
  }, [isLoading, isFetchingNextPage])

  const addLink = trpc.example.addLink.useMutation({
    onSuccess() {
      if (inputRef.current?.value) {
        inputRef.current.value = ''
      }
      // @ts-ignore
      if (typeof window?.plausible === 'function') {
        // @ts-ignore
        window.plausible('add-link')
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
      // @ts-ignore
      if (typeof window?.plausible === 'function') {
        // @ts-ignore
        window.plausible('search-link')
      }
      setSearch(value)
    }
  }

  const links = data?.pages.flatMap((page) => page.items) ?? []

  const filteredLinks =
    links.filter(
      (link) => !search || link.url.includes(search) || link.desc?.toLowerCase().includes(search)
    ) || []

  return (
    <>
      <Head>
        <title>Links</title>
        <meta name="description" content="Links app" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="rgb(203, 213, 225)" />
      </Head>
      <main className="flex h-[100dvh] flex-col gap-4 overflow-auto bg-slate-300 p-4">
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
        <div
          className="flex flex-1 flex-wrap items-start justify-around gap-4 overflow-auto pb-3"
          ref={linksRef}
        >
          {addLink.isLoading && <Loading />}
          {isLoading &&
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((x) => <Loading key={x} />)}
          {filteredLinks.map((link, i) => (
            <a
              ref={i === filteredLinks.length - 1 && !isEndReached ? ref : null}
              key={link.url}
              className={`
                'duration-300',
                group
                flex
                h-60
                w-full
                flex-col
                items-center
                rounded-lg
                bg-slate-200
                p-2
                shadow-lg
                transition-colors
                hover:bg-slate-50
                md:max-w-sm
              `}
              target="_blank"
              href={link.url}
              rel="noreferrer"
            >
              <img
                alt="logo"
                className="h-36 rounded-lg"
                src={link.image || 'https://api.dicebear.com/6.x/shapes/svg?seed=' + link.url}
              />
              <div className="line-clamp-2 font-semibold text-slate-700">{link.desc || link.url}</div>
              <div className="flex-1"></div>
              <div className="font-mono text-xs text-gray-400">{link.url}</div>
            </a>
          ))}
          {isEndReached && <div className="w-full text-center text-2xl text-slate-400">no more links</div>}
          {isFetchingNextPage && <Loading isFull />}
        </div>
      </main>
    </>
  )
}

export default Home
