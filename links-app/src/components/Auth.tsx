import PocketBase, { Record, RecordAuthResponse } from 'pocketbase'
import { useEffect, useState } from 'react'

async function auth() {
  const client = new PocketBase('http://localhost:8090')
  const methods = await client.collection('users').listAuthMethods()
  console.log(methods)
}

export default function AuthComponent() {
  const [client, setClient] = useState<string | null>(null)
  const [account, setAccount] = useState<RecordAuthResponse<Record> | null>(null)
  useEffect(() => {
    auth()
  }, [])

  const login = async () => {
    const client = new PocketBase('http://localhost:8090')
    if (!client.authStore.isValid) {
      // const authdata = await client.collection('users').authWithOAuth2({ provider: 'github' })
      const authdata = null
      setAccount(authdata)
    }
    setClient(
      JSON.stringify(
        {
          model: client.authStore.model,
          token: client.authStore.token,
          isValid: client.authStore.isValid,
        },
        null,
        2
      )
    )
  }

  return (
    <div className="border-red-500 pt-[200px]">
      <div>auth</div>
      <pre>{JSON.stringify(account, null, 2)}</pre>
      <pre>{client}</pre>
      <button
        className="rounded-lg bg-blue-500 bg-gradient-to-r from-blue-400 px-6 py-2 text-white shadow"
        onClick={() => login()}
      >
        auth
      </button>
    </div>
  )
}
