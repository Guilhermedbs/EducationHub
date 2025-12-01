import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
    const body = isLogin 
      ? { email: form.email, password: form.password }
      : form

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">EducationHub</h1>
        
        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 ${isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 ${!isLogin ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Cadastro
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Nome"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 border rounded"
                required
              />
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full p-3 border rounded"
              >
                <option value="STUDENT">Aluno</option>
                <option value="TEACHER">Professor</option>
              </select>
            </>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full p-3 border rounded"
            required
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  )
}


