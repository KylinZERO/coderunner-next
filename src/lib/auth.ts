import bcrypt from 'bcryptjs'

export { signToken, verifyToken, getTokenFromRequest, getAuthFromRequest } from './jwt'
export type { JWTPayload } from './jwt'

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
