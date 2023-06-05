import z from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { getQueryKey } from '@trpc/react-query'

import { getFromData } from 'utils/form'
import { trpc } from 'utils/trpc'
import { clx } from 'utils/clx'

const schema = z.object({
  search: z.string().min(1),
})

export default function LinkInput() {
  const queryClient = useQueryClient()
  const { mutateAsync, isLoading, isError } = trpc.example.addLink.useMutation({
    onSettled() {
      const key = getQueryKey(trpc.example.linksp, { limit: 16 }, 'infinite')
      queryClient.invalidateQueries(key)
    }
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

  return (
    <form onSubmit={onAddLink} className={clx({ "bg-red-800": isError }, "bg-slate-600 p-6 shadow-md dark:bg-slate-600 dark:shadow-slate-700")}>
      <input
        disabled={isLoading}
        name="search"
        className="w-full rounded-lg p-2 text-xl focus:shadow-md dark:bg-slate-700 dark:text-slate-200"
        placeholder="http..."
      />
    </form>
  )
}
