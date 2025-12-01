import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface Resource {
  id: string
  title: string
  type: string
  url: string
}

interface Feedback {
  id: string
  rating: number
  comment: string
  student: { name: string }
  createdAt: string
}

interface Course {
  id: string
  name: string
  description: string
  teacher: { id: string; name: string; email: string }
  resources: Resource[]
  feedbacks: Feedback[]
}

interface User {
  id: string
  role: string
}

export default function CourseDetail() {
  const router = useRouter()
  const { id } = router.query
  const [course, setCourse] = useState<Course | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' })
  const [resourceForm, setResourceForm] = useState({ title: '', type: 'PDF', url: '' })
  const [showResourceForm, setShowResourceForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    if (id) loadCourse()
  }, [id])

  const loadCourse = async () => {
    const res = await fetch(`/api/courses/${id}`)
    if (res.ok) {
      setCourse(await res.json())
    }
  }

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('token')

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ courseId: id, ...feedbackForm })
    })

    if (res.ok) {
      setFeedbackForm({ rating: 5, comment: '' })
      loadCourse()
    }
    setLoading(false)
  }

  const handleResource = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('token')

    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ courseId: id, ...resourceForm })
    })

    if (res.ok) {
      setResourceForm({ title: '', type: 'PDF', url: '' })
      setShowResourceForm(false)
      loadCourse()
    }
    setLoading(false)
  }

  if (!course) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Carregando...</div>
  }

  const isTeacher = user?.role === 'TEACHER'
  const isOwner = user?.id === course.teacher.id

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-blue-500 hover:underline">← Voltar</Link>
          <h1 className="text-xl font-bold">EducationHub</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-2xl font-bold">{course.name}</h2>
          <p className="text-gray-600 mt-2">{course.description}</p>
          <p className="text-gray-400 text-sm mt-2">Professor: {course.teacher.name} ({course.teacher.email})</p>
        </div>

        {/* Recursos */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Recursos</h3>
            {isOwner && (
              <button
                onClick={() => setShowResourceForm(!showResourceForm)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                {showResourceForm ? 'Cancelar' : '+ Adicionar'}
              </button>
            )}
          </div>

          {showResourceForm && (
            <form onSubmit={handleResource} className="bg-gray-50 p-4 rounded mb-4 space-y-3">
              <input
                type="text"
                placeholder="Título"
                value={resourceForm.title}
                onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <select
                value={resourceForm.type}
                onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="PDF">PDF</option>
                <option value="VIDEO">Vídeo</option>
                <option value="LINK">Link</option>
                <option value="SLIDES">Slides</option>
              </select>
              <input
                type="url"
                placeholder="URL"
                value={resourceForm.url}
                onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
              <button type="submit" disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          )}

          {course.resources.length === 0 ? (
            <p className="text-gray-500">Nenhum recurso disponível.</p>
          ) : (
            <ul className="space-y-2">
              {course.resources.map(r => (
                <li key={r.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {r.type}
                  </span>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {r.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Feedbacks */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-bold mb-4">Feedbacks</h3>

          {!isTeacher && user && (
            <form onSubmit={handleFeedback} className="bg-gray-50 p-4 rounded mb-4 space-y-3">
              <div>
                <label className="block text-sm mb-1">Nota (1-5)</label>
                <select
                  value={feedbackForm.rating}
                  onChange={e => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
                  className="w-full p-2 border rounded"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} estrela{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Seu comentário..."
                value={feedbackForm.comment}
                onChange={e => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
                required
              />
              <button type="submit" disabled={loading} className="bg-green-500 text-white px-4 py-2 rounded">
                {loading ? 'Enviando...' : 'Enviar Feedback'}
              </button>
            </form>
          )}

          {course.feedbacks.length === 0 ? (
            <p className="text-gray-500">Nenhum feedback ainda.</p>
          ) : (
            <div className="space-y-3">
              {course.feedbacks.map(f => (
                <div key={f.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{f.student.name}</span>
                    <span className="text-yellow-500">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{f.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


