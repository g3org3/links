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
    const data = {url: input.url}
    const record = await client.collection('tech_links').create(data);
    return record
  })
});
