import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { getUserFromRequest } from '../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromRequest(req)
  
  if (!user) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  // GET - Listar mensagens do usuário
  if (req.method === 'GET') {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: user.id },
          { toUserId: user.id }
        ]
      },
      include: {
        fromUser: { select: { id: true, name: true, email: true } },
        toUser: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return res.status(200).json(messages)
  }

  // POST - Enviar mensagem
  if (req.method === 'POST') {
    const { toEmail, content } = req.body

    if (!toEmail || !content) {
      return res.status(400).json({ error: 'Email do destinatário e conteúdo são obrigatórios' })
    }

    // Buscar destinatário pelo email
    const toUser = await prisma.user.findUnique({
      where: { email: toEmail }
    })

    if (!toUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (toUser.id === user.id) {
      return res.status(400).json({ error: 'Você não pode enviar mensagem para si mesmo' })
    }

    const message = await prisma.message.create({
      data: {
        fromUserId: user.id,
        toUserId: toUser.id,
        content
      },
      include: {
        fromUser: { select: { id: true, name: true, email: true } },
        toUser: { select: { id: true, name: true, email: true } }
      }
    })

    return res.status(201).json(message)
  }

  return res.status(405).json({ error: 'Método não permitido' })
}


