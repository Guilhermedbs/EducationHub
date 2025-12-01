import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { NextApiRequest } from 'next'
import prisma from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-aqui'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export async function getUserFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)
  
  if (!payload) {
    return null
  }
  
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  })
  
  return user
}

