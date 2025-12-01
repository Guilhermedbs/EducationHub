import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Course {
  id: string
  name: string
  description: string
  teacher: { name: string }
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      router.push('/')
      return
    }
    setUser(JSON.parse(stored))
    loadCourses()
  }, [router])

  const loadCourses = async () => {
    const res = await fetch('/api/courses')
    const data = await res.json()
    setCourses(data)
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('token')

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      setForm({ name: '', description: '' })
      setShowForm(false)
      loadCourses()
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">EducationHub</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role === 'TEACHER' ? 'Professor' : 'Aluno'})
            </span>
            <Link href="/messages" className="text-blue-500 hover:underline">
              Mensagens
            </Link>
            <button onClick={handleLogout} className="text-red-500 hover:underline">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {user.role === 'TEACHER' ? 'Minhas Disciplinas' : 'Disciplinas Disponíveis'}
          </h2>
          {user.role === 'TEACHER' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {showForm ? 'Cancelar' : 'Nova Disciplina'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreateCourse} className="bg-white p-4 rounded shadow mb-6 space-y-4">
            <input
              type="text"
              placeholder="Nome da disciplina"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 border rounded"
              required
            />
            <textarea
              placeholder="Descrição"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 border rounded"
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {loading ? 'Criando...' : 'Criar Disciplina'}
            </button>
          </form>
        )}

        <div className="grid gap-4">
          {courses.length === 0 ? (
            <p className="text-gray-500">Nenhuma disciplina cadastrada.</p>
          ) : (
            courses.map(course => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-white p-4 rounded shadow hover:shadow-md block"
              >
                <h3 className="font-bold text-lg">{course.name}</h3>
                <p className="text-gray-600 text-sm">{course.description}</p>
                <p className="text-gray-400 text-xs mt-2">Professor: {course.teacher.name}</p>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}


