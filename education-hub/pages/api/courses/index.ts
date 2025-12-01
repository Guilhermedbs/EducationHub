import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getUserFromRequest } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Listar todos os cursos
  if (req.method === 'GET') {
    const courses = await prisma.course.findMany({
      include: {
        teacher: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(courses)
  }

  // POST - Criar curso (apenas professor)
  if (req.method === 'POST') {
    const user = await getUserFromRequest(req)
    
    if (!user) {
      return res.status(401).json({ error: 'Não autorizado' })
    }
    
    if (user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Apenas professores podem criar cursos' })
    }

    const { name, description } = req.body

    if (!name || !description) {
      return res.status(400).json({ error: 'Nome e descrição são obrigatórios' })
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        teacherId: user.id
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } }
      }
    })

    return res.status(201).json(course)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}


