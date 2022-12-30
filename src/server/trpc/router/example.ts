import { z } from "zod";
import PocketBase from 'pocketbase';
import { router, publicProcedure } from "../trpc";

const client = new PocketBase('https://pocketbase-production-f6a9.up.railway.app');

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  links: publicProcedure.query(async () => {
    const records = await client.collection('tech_links').getFullList(200, {
      sort: '-created',
    });

    return records
  }),
  addLink: publicProcedure.input(z.object({url: z.string()})).mutation(async ({input}) => {
    
    const res = await fetch(input.url)
    const text = await res.text()
    const metaTags = getMetaTags(text)
    const descriptions = metaTags.filter(text => text.includes('description'))
    const images = metaTags.filter(text => text.includes(':image'))
    
    
    const [desc] = getMetaTagContents(descriptions[0] || '')
    const [image] = getMetaTagContents(images[0] || '')
    const data = {url: input.url, desc, image}
    
    const record = await client.collection('tech_links').create(data);
    return record
  })
});

function getMetaTagContents(html: string) {
  const regex = /<meta[^>]*content="([^"]*)"[^>]*>/gi;
  const matches = [];
  let match;
  
  // Find all matches
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1]);
  }
  
  return matches;
}



function getMetaTags(html:string) {
  const regex = /<meta[^>]*>/gi;
  const matches = [];
  let match;
  
  // Find all matches
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[0]);
  }
  
  return matches;
}