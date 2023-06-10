import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'
import { useEffect } from 'react'
import z from 'zod'

import { clx } from 'utils/clx'
import { getFromData } from 'utils/form'
import { trpc } from 'utils/trpc'

const schema = z.object({
  search: z.string().min(1),
})

export default function LinkInput() {
  const queryClient = useQueryClient()
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

    if (!value) return

    if (value.includes('http')) {
      mutateAsync({ url: value }).then(() => reset())
    } else {
      // @ts-ignore
      if (typeof window?.plausible === 'function') {
        // @ts-ignore
        window.plausible('search-link')
      }
      reset()
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
        'bg-slate-600 p-6 shadow-md dark:bg-slate-600 dark:shadow-slate-700'
      )}
    >
      <input
        disabled={isLoading}
        name="search"
        className="w-full rounded-lg p-2 text-xl focus:shadow-md dark:bg-slate-700 dark:text-slate-200"
        placeholder="http..."
      />
    </form>
  )
}