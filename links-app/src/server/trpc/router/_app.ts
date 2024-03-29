import { router } from 'server/trpc/trpc'

import { exampleRouter } from './example'

export const appRouter = router({
  example: exampleRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
