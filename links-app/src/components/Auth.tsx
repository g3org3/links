import { useMutation, useQuery } from '@tanstack/react-query'
import PocketBase, { RecordAuthResponse } from 'pocketbase'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'

import { clx } from 'utils/clx'
import { getFromData } from 'utils/form'
import { UsersResponse } from 'utils/pbtypes'

const url = 'https://pb3.jorgeadolfo.com'

export default function AuthComponent() {
  const [_, setProfile] = useState<RecordAuthResponse<UsersResponse> | undefined>(undefined)
  const client = useRef(new PocketBase(url))

  const { data: clients, refetch } = useQuery({
    queryFn: () => client.current.collection('pubtokens').getFullList(),
    enabled: client.current.authStore.isValid,
  })
  const { mutate, isLoading: isMutating } = useMutation({
    // @ts-ignore
    mutationFn: ({ id, active }: { id: string; active: boolean }) => {
      client.current.collection('pubtokens').update(id, { active })
    },
    onSuccess: () => {
      refetch()
    },
  })

  useEffect(() => {
    client.current.collection('pubtokens').subscribe('*', () => {
      refetch()
    })
  }, [])

  const login = async () => {
    if (!client.current.authStore.isValid) {
      const authdata = await client.current
        .collection('users')
        .authWithOAuth2<UsersResponse>({ provider: 'google' })
      setProfile(authdata)
      console.log(authdata)
    }
  }

  const logout = () => {
    client.current.authStore.clear()
    setProfile(undefined)
  }

  const onToggle = (id: string, active: boolean) => {
    mutate({ id, active })
  }

  const onAuthClient: React.FormEventHandler = (e) => {
    const schema = z.object({ clientid: z.string() })
    const { data, reset } = getFromData(schema, e)
    if (data) {
      client.current
        .collection('pubtokens')
        .create({
          clientid: data.clientid,
          authid: client.current.authStore.token,
          user: client.current.authStore.model?.id,
          active: true,
        })
        .finally(() => {
          reset()
        })
    }
  }

  if (client.current.authStore.isValid) {
    return (
      <div className="mx-2 flex flex-col items-center gap-4 self-center bg-white p-5">
        <h1 className="text-4xl">Welcome {client.current.authStore.model?.email}!</h1>
        <form className="flex" onSubmit={onAuthClient}>
          <input className="rounded-l border px-4 py-2" placeholder="client id" name="clientid" />
          <button className="rounded-r bg-blue-600 px-4 py-2 text-white">authenticate client</button>
        </form>
        <table className="table w-full table-auto">
          <thead>
            <tr className="text-left">
              <th></th>
              <th>id</th>
              <th>name</th>
              <th>action</th>
            </tr>
          </thead>
          {clients?.map((c) => (
            <tr className="border-y" key={c.id}>
              <td>
                <span
                  className={clx(
                    { 'bg-green-400': c.active, 'bg-red-400': !c.active },
                    'block h-[20px] w-[20px] rounded-full'
                  )}
                />
              </td>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>
                <button
                  disabled={isMutating}
                  className="my-2 rounded-md bg-slate-200 px-4 py-1 hover:bg-slate-100"
                  onClick={() => onToggle(c.id, !c.active)}
                >
                  {isMutating ? 'updating...' : 'toggle'}
                </button>
              </td>
            </tr>
          ))}
        </table>
        <button
          className="rounded-lg bg-blue-500 bg-gradient-to-r from-blue-400 px-6 py-2 text-white shadow"
          onClick={() => logout()}
        >
          logout
        </button>
      </div>
    )
  }

  return (
    <div className="flex w-[400px] flex-col items-center gap-4 self-center bg-white p-5">
      <h1 className="text-4xl">Please login</h1>
      <button
        className="rounded-lg bg-blue-500 bg-gradient-to-r from-blue-400 px-6 py-2 text-white shadow"
        onClick={() => login()}
      >
        login with Google
      </button>
    </div>
  )
}
