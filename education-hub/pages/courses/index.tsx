import { useEffect } from 'react'
import { useRouter } from 'next/router'

// Redireciona para o dashboard que já lista os cursos
export default function CoursesIndex() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return null
}


