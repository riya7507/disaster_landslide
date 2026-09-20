import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { getDatabase } from './db';
import { Role, User } from './types';

const JWT_SECRET = process.env.SECRET_KEY || 'landguard_super_secret_jwt_key_sih26001_ner';

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
  organization?: string;
}

export function generateToken(user: User): string {
  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    organization: user.organization,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (err) {
    return null;
  }
}

// Express Request extension for authenticated user
export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // For prototype accessibility, citizen view can proceed or return 401
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Insufficient permissions. Requires one of: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
}

export function loginUser(email: string, passwordPlain: string): { user: Omit<User, 'passwordHash'>; token: string } | null {
  const db = getDatabase();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) return null;

  const valid = bcrypt.compareSync(passwordPlain, user.passwordHash);
  if (!valid) return null;

  const token = generateToken(user);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
}
