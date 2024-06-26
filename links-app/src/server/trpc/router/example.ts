import PocketBase from 'pocketbase'
import { z } from 'zod'

import { router, publicProcedure } from 'server/trpc/trpc'
import { LinksResponse } from 'utils/pbtypes'

const client = new PocketBase('https://pb3.jorgeadolfo.com')

export const exampleRouter = router({
  hello: publicProcedure.input(z.object({ text: z.string().nullish() }).nullish()).query(({ input }) => {
    return {
      greeting: `Hello ${input?.text ?? 'world'}`,
    }
  }),
  search: publicProcedure.input(z.object({ query: z.string().nullish() })).query(async ({ input }) => {
    if (!input.query) return []

    // console.log(await client.collection('users').listAuthMethods())
    // const u = client.collection('users')

    const result = await client.collection('links').getList<LinksResponse>(1, 10, {
      filter: `(url ~ '${input.query}') || (desc ~ '${input.query}')`,
    })

    return result.items
  }),
  linksp: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(32),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input }) => {
      const links = await client
        .collection('links')
        .getList<LinksResponse>(
          !input.cursor ? 1 : input.cursor + 1,
          !input.cursor ? input.limit * 2 : input.limit,
          {
            sort: '-created',
          }
        )

      return links
    }),
  links: publicProcedure.query(async () => {
    const records = await client.collection('links').getFullList(200, {
      sort: '-created',
    })

    return records
  }),
  addLink: publicProcedure.input(z.object({ url: z.string() })).mutation(async ({ input }) => {
    try {
      const { title, desc, image, tags } = await scrappeUrl(input.url)
      const uid = '9jlds13a5q77zq5'
      const data = {
        title,
        tags,
        author: uid,
        url: input.url,
        desc,
        image: image && image.startsWith('/') ? input.url + image : image,
      }
      await client.collection('links').create(data)
    } catch (err) {
      console.error(err)
      throw err
    }
  }),
})

/**
 * @param {string} url
 */
async function scrappeUrl(url: string) {
  const res = await fetch(url)
  const text = await res.text()
  const metaTags = getMetaTags(text)
  const keywords = metaTags.filter((text) => text.includes('keywords'))
  const descriptions = metaTags.filter((text) => text.includes('description'))
  const images = metaTags.filter((text) => text.includes(':image"'))

  // console.log({ images, descriptions })
  const [desc] = getMetaTagContents(descriptions[0] || '')
  const [image] = getMetaTagContents(images[0] || '')
  const [tags] = getMetaTagContents(keywords[0] || '')
  const [title] = getTitle(text)
  const domain = url.split('/')[2]

  return {
    desc,
    image,
    title,
    tags: (tags || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      // @ts-ignore
      .concat([domain]),
  }
}

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

function getTitle(html: string) {
  const regex = /<title>([^<]+)<\/title>/gi
  const matches = []
  let match

  // Find all matches
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1])
  }

  return matches
}
