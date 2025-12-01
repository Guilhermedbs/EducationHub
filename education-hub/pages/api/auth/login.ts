import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { verifyPassword, generateToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' })
  }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  const validPassword = await verifyPassword(password, user.passwordHash)

  if (!validPassword) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })

  return res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  })
}

