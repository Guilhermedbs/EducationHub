import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { hashPassword, generateToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
  }

  // Verificar se email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return res.status(400).json({ error: 'Email já cadastrado' })
  }

  // Validar role
  const userRole = role === 'TEACHER' ? 'TEACHER' : 'STUDENT'

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: userRole
    }
  })

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })

  return res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  })
}

