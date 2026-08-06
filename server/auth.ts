import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import type { User, SafeUser } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "shinara-mall-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface JWTPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  
  const user = await storage.getUser(payload.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "User not found or inactive" });
  }
  
  req.user = toSafeUser(user);
  next();
};

export const optionalAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = await storage.getUser(payload.userId);
      if (user && user.isActive) {
        req.user = toSafeUser(user);
      }
    }
  }
  
  next();
};
