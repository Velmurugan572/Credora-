import crypto from 'crypto'
import { getDb, saveDb, UserRecord } from './db'

const JWT_SECRET = 'credora_production_jwt_secret_key_2026_india'

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex')
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

export interface SessionTokenPayload {
  userId: string
  email: string
  name: string
  exp: number
}

export function createSessionToken(userId: string, email: string, name: string): string {
  const payload: SessionTokenPayload = {
    userId,
    email,
    name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  }
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url')
  return `${payloadBase64}.${signature}`
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [payloadBase64, signature] = parts
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url')
    if (signature !== expectedSignature) return null

    const payload: SessionTokenPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'))
    if (Date.now() > payload.exp) return null
    return payload
  } catch (err) {
    return null
  }
}

export function getAuthenticatedUser(token: string): UserRecord | null {
  const payload = verifySessionToken(token)
  if (!payload) return null
  const db = getDb()
  return db.users.find(u => u.id === payload.userId) || null
}
