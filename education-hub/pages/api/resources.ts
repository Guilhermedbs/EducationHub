import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { getUserFromRequest } from '../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const user = await getUserFromRequest(req)
  
  if (!user) {
    return res.status(401).json({ error: 'Não autorizado' })
  }
  
  if (user.role !== 'TEACHER') {
    return res.status(403).json({ error: 'Apenas professores podem adicionar recursos' })
  }

  const { courseId, title, type, url } = req.body

  if (!courseId || !title || !type || !url) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
  }

  // Verificar se o curso pertence ao professor
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  })

  if (!course || course.teacherId !== user.id) {
    return res.status(403).json({ error: 'Você só pode adicionar recursos aos seus próprios cursos' })
  }

  const validTypes = ['PDF', 'VIDEO', 'LINK', 'SLIDES']
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Tipo inválido. Use: PDF, VIDEO, LINK ou SLIDES' })
  }

  const resource = await prisma.resource.create({
    data: { courseId, title, type, url }
  })

  return res.status(201).json(resource)
}


