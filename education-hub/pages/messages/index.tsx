import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  fromUser: User
  toUser: User
}

export default function Messages() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [form, setForm] = useState({ toEmail: '', content: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      router.push('/')
      return
    }
    setUser(JSON.parse(stored))
    loadMessages()
  }, [router])

  const loadMessages = async () => {
    const token = localStorage.getItem('token')
    const res = await fetch('/api/messages', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) {
      setMessages(await res.json())
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const token = localStorage.getItem('token')

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setForm({ toEmail: '', content: '' })
      loadMessages()
    }
    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-blue-500 hover:underline">← Voltar</Link>
          <h1 className="text-xl font-bold">Mensagens</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* Formulário de envio */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-bold mb-4">Nova Mensagem</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={handleSend} className="space-y-3">
            <input
              type="email"
              placeholder="Email do destinatário"
              value={form.toEmail}
              onChange={e => setForm({ ...form, toEmail: e.target.value })}
              className="w-full p-3 border rounded"
              required
            />
            <textarea
              placeholder="Sua mensagem..."
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              className="w-full p-3 border rounded"
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>

        {/* Lista de mensagens */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold mb-4">Histórico</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500">Nenhuma mensagem.</p>
          ) : (
            <div className="space-y-3">
              {messages.map(m => {
                const isSent = m.fromUser.id === user.id
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded ${isSent ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50 border-l-4 border-gray-300'}`}
                  >
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>
                        {isSent ? `Para: ${m.toUser.name}` : `De: ${m.fromUser.name}`}
                      </span>
                      <span>{new Date(m.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                    <p>{m.content}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


