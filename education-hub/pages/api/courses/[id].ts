import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { id } = req.query

  const course = await prisma.course.findUnique({
    where: { id: id as string },
    include: {
      teacher: { select: { id: true, name: true, email: true } },
      resources: { orderBy: { createdAt: 'desc' } },
      feedbacks: {
        include: {
          student: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!course) {
    return res.status(404).json({ error: 'Curso não encontrado' })
  }

  return res.status(200).json(course)
}


