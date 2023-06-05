import { FormEvent } from 'react'
import z from 'zod'

export function getFromData<T extends Record<string, string>>(
  schema: z.ZodType<T>,
  event: FormEvent<Element>
) {
  event.preventDefault()

  const inputs = Array.from(event.target as never).filter(
    (x) => typeof x === 'object' && x != null && 'name' in x && x.name
  ) as HTMLInputElement[]

  const form = inputs.reduce<Record<string, string>>(
    (byName, x) => ({
      ...byName,
      [x.name]: x.value,
    }),
    {}
  )

  let data: T | null = null
  const isOk = schema.safeParse(form)

  if (isOk) {
    data = schema.parse(form)
  }

  return {
    error: data == null,
    data,
    reset: () =>
      inputs.forEach((input) => {
        input.value = ''
      }),
  }
}
