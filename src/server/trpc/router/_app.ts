import { router } from '../trpc'
// eslint-disable-next-line
import { exampleRouter } from './example'

export const appRouter = router({
  example: exampleRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
