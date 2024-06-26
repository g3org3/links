import { useIntersection } from '@mantine/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { type NextPage } from 'next'
import PocketBase from 'pocketbase'
import { useEffect, useRef } from 'react'

import LinkCard from 'components/LinkCard'
import LinkInput from 'components/LinkInput'
import Loading from 'components/Loading'
import { useApp } from 'stores/appStore'
import { trpc } from 'utils/trpc'

const Home: NextPage = () => {
  const queryClient = useQueryClient()
  const search = useApp((s) => s.search)
  const addLinks = useApp((s) => s.addLinks)
  const addPage = useApp((s) => s.addPage)
  const storelinks = useApp((s) => s.links)
  const key = getQueryKey(trpc.example.linksp, { limit: 16 }, 'infinite')
  const { isFetching: isSearching, data: searchResults } = trpc.example.search.useQuery(
    { query: search },
    { enabled: !!search, staleTime: 10 * 1000 }
  )
  const { data, isFetching, isLoading, isFetchingNextPage, fetchNextPage } =
    trpc.example.linksp.useInfiniteQuery(
      { limit: 16 },
      {
        staleTime: 10 * 1000,
        getNextPageParam: (lastPage) => lastPage.page + 1,
        onSuccess(linksbypage) {
          const isDiff = storelinks[0]?.id !== linksbypage.pages.at(0)?.items[0]?.id
          const links = linksbypage.pages.at(isDiff ? 0 : -1)
          if (links?.items) addLinks(links.items, isDiff)
        },
      }
    )
  const lastPostRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  })

  const isEndReached = data?.pages && data?.pages[0]?.totalPages === data?.pages.length

  useEffect(() => {
    const client = new PocketBase('https://pb3.jorgeadolfo.com')
    client.realtime.subscribe('links', () => {
      queryClient.invalidateQueries(key)
    })

    return () => {
      client.realtime.unsubscribe('links')
    }
  }, [])

  useEffect(() => {
    if (!isEndReached && entry?.isIntersecting) {
      addPage()
      fetchNextPage()
    }
  }, [entry?.isIntersecting, isEndReached])

  // let links = data?.pages.flatMap((page) => page.items) ?? []
  let links = storelinks

  if (search) {
    links = searchResults ?? []
  }

  return (
    <>
      <LinkInput />
      <div
        className="flex flex-1 flex-wrap items-start justify-around gap-4 overflow-auto p-6 pt-[120px] shadow-inner"
        ref={linksRef}
      >
        {(isLoading || isSearching) && new Array(16).fill(0).map((_, x) => <Loading key={x} />)}
        {links.map((link, i) => (
          <LinkCard
            key={link.url}
            link={link}
            cardRef={i === links.length - 1 && !isEndReached && !search ? ref : null}
          />
        ))}
        {!!search && links.length === 0 && (
          <div className="mt-20 w-full text-center text-3xl text-white opacity-75">no search results</div>
        )}
        {isEndReached && <div className="w-full text-center text-2xl text-slate-400">no more links</div>}
        {/* {isFetchingNextPage && <Loading isFull />} */}
      </div>
      {isFetching && !isFetchingNextPage && !isLoading && (
        <div className="fixed bottom-0 left-0 w-[100dvw] animate-pulse bg-slate-600 text-center text-slate-200">
          Fetching...
        </div>
      )}
      {isSearching && (
        <div className="fixed bottom-0 left-0 w-[100dvw] animate-pulse bg-slate-600 text-center text-slate-200">
          Searching...
        </div>
      )}
    </>
  )
}

export default Home
