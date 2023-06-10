import PocketBase from 'pocketbase'
import { z } from 'zod'

import { router, publicProcedure } from 'server/trpc/trpc'

const client = new PocketBase('https://pocketbase-production-f6a9.up.railway.app')

export const exampleRouter = router({
  hello: publicProcedure.input(z.object({ text: z.string().nullish() }).nullish()).query(({ input }) => {
    return {
      greeting: `Hello ${input?.text ?? 'world'}`,
    }
  }),
  search: publicProcedure.input(z.object({ query: z.string().nullish() })).query(async ({ input }) => {
    console.log('/search')
    if (!input.query) return []

    const result = await client
      .collection('tech_links')
      .getList(1, 10, { filter: `(url ~ '${input.query}') || (desc ~ '${input.query}')` })

    return result.items
  }),
  linksp: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(24).nullish(),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input }) => {
      const links = await client
        .collection('tech_links')
        .getList(input.cursor || 1, input.limit || 12, { sort: '-created' })

      return links
    }),
  links: publicProcedure.query(async () => {
    const records = await client.collection('tech_links').getFullList(200, {
      sort: '-created',
    })

    return records
  }),
  addLink: publicProcedure.input(z.object({ url: z.string() })).mutation(async ({ input }) => {
    try {
      const res = await fetch(input.url)
      const text = await res.text()
      const metaTags = getMetaTags(text)
      const descriptions = metaTags.filter((text) => text.includes('description'))
      const images = metaTags.filter((text) => text.includes(':image"'))

      // console.log({ images, descriptions })
      const [desc] = getMetaTagContents(descriptions[0] || '')
      const [image] = getMetaTagContents(images[0] || '')
      const data = { url: input.url, desc, image: image && image.startsWith('/') ? input.url + image : image }

      await client.collection('tech_links').create(data)
    } catch (err) {
      // console.error(err)
      throw err
    }
  }),
})

function getMetaTagContents(html: string) {
  const regex = /<meta[^>]*content="([^"]*)"[^>]*>/gi
  const matches = []
  let match

  // Find all matches
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1])
  }

  return matches
}

function getMetaTags(html: string) {
  const regex = /<meta[^>]*>/gi
  const matches = []
  let match

  // Find all matches
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[0])
  }

  return matches
}
