import jwt, { SignOptions } from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

export const generateToken = (user: UserPayload): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  const expiration = process.env.JWT_EXPIRATION || '1d';
  
  return jwt.sign(user, secret, { 
    expiresIn: expiration as any 
  });
};

export const verifyToken = (token: string): UserPayload => {
  const secret = process.env.JWT_SECRET || 'default-secret-key';
  
  try {
    return jwt.verify(token, secret) as UserPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};