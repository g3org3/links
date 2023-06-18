import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useEffect, useState } from 'react'
import z from 'zod'

import { useApp } from 'stores/appStore'
import { clx } from 'utils/clx'
import { getFromData } from 'utils/form'
import { trpc } from 'utils/trpc'

const schema = z.object({
  search: z.string(),
})

export default function LinkInput() {
  const queryClient = useQueryClient()
  const [isSearching, setIsSearching] = useState(false)
  const setSearch = useApp((s) => s.setSearch)
  const key = getQueryKey(trpc.example.linksp, { limit: 16 }, 'infinite')
  const { mutateAsync, isLoading, isError } = trpc.example.addLink.useMutation({
    async onMutate() {
      await queryClient.cancelQueries(key)
    },
    onSettled() {
      queryClient.invalidateQueries(key)
    },
  })

  const onAddLink: React.FormEventHandler<HTMLFormElement> = (e) => {
    const { data, reset } = getFromData(schema, e)
    const value = data?.search

    if (!value) {
      setSearch(null)

      return
    }

    if (value.includes('http')) {
      mutateAsync({ url: value }).then(() => reset())
    } else {
      // @ts-ignore
      if (typeof window?.plausible === 'function') {
        // @ts-ignore
        window.plausible('search-link')
      }
      setSearch(value)
    }
  }

  useEffect(() => {
    if (isLoading) {
      window.onbeforeunload = () => 'Are you sure you want to close the window?'
    } else {
      window.onbeforeunload = () => {}
    }

    return () => {
      window.onbeforeunload = () => {}
    }
  }, [isLoading])

  return (
    <form
      onSubmit={onAddLink}
      className={clx(
        { 'bg-red-800': isError },
        'fixed left-0 top-0 z-50 flex w-[100dvw] flex-col bg-white bg-opacity-40 p-2 backdrop-blur dark:bg-slate-600'
      )}
    >
      <div className="flex gap-2">
        <input
          disabled={isLoading}
          name="search"
          className={clx(
            { hidden: !isSearching },
            'container mx-auto w-full rounded-lg p-2 text-xl focus:shadow-md dark:bg-slate-700 dark:text-slate-200'
          )}
          placeholder="add new link with http... or search"
        />
      </div>
    </form>
  )
}
