import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { getUserFromRequest } from '../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req)
  
  if (!user) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  // GET - Listar feedbacks (filtrar por courseId opcional)
  if (req.method === 'GET') {
    const { courseId } = req.query
    
    const feedbacks = await prisma.feedback.findMany({
      where: courseId ? { courseId: courseId as string } : {},
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return res.status(200).json(feedbacks)
  }

  // POST - Criar feedback (apenas aluno)
  if (req.method === 'POST') {
    if (user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Apenas alunos podem enviar feedback' })
    }

    const { courseId, rating, comment } = req.body

    if (!courseId || !rating || !comment) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating deve ser entre 1 e 5' })
    }

    // Verificar se curso existe
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return res.status(404).json({ error: 'Curso não encontrado' })
    }

    const feedback = await prisma.feedback.create({
      data: {
        courseId,
        studentId: user.id,
        rating: Number(rating),
        comment
      },
      include: {
        student: { select: { id: true, name: true } }
      }
    })

    return res.status(201).json(feedback)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}


