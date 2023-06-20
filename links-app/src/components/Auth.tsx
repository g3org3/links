import { useEffect, useState } from "react"
import PocketBase from 'pocketbase'

async function auth() {
  const client = new PocketBase('http://localhost:8090')
  const methods = await client.collection('users').listAuthMethods()
  console.log(methods)
}

export default function() {
  const [client, setClient] = useState(null)
  const [account, setAccount] = useState(null)
  useEffect(() => {
    auth()
  }, [])

  const login = async () => {
    const client = new PocketBase('http://localhost:8090')
    if (!client.authStore.isValid) {
      const authdata = await client.collection('users').authWithOAuth2({ provider: 'github' })
      setAccount(authdata)
    }
    setClient(JSON.stringify({
      model: client.authStore.model,
      token: client.authStore.token,
      isValid: client.authStore.isValid,
    }, null, 2))
  }

  return <div className="border-red-500 pt-[200px]">
    <div>auth</div>
    <pre>{JSON.stringify(account, null, 2)}</pre>
    <pre>{client}</pre>
    <button className="px-6 bg-gradient-to-r text-white shadow from-blue-400 py-2 bg-blue-500 rounded-lg" onClick={() => login()}>auth</button>
  </div>
}
