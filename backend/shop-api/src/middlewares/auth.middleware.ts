import { Request, Response, NextFunction } from "express";

/**
 * Authentication middleware for shop-api
 * Extracts userId from Better Auth JWT cookie set by users-api
 * 
 * Since Better Auth handles auth in users-api, we just need to extract
 * the userId from the session cookie for authorization checks
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // For now, we'll extract userId from the Authorization header or cookie
    // In production, you should validate the JWT token from Better Auth
    
    // Extract from Authorization header (if present)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      // In a real implementation, decode and validate JWT
      // For now, we'll trust the gateway to have validated it
      (req as any).userId = "user-id-from-jwt"; // Placeholder
      return next();
    }

    // Extract from session cookie (Better Auth format)
    const cookies = req.headers.cookie;
    if (cookies) {
      // Better Auth sets cookies - parse them
      // In production, validate the session with users-api or decode JWT
      (req as any).userId = "user-id-from-cookie"; // Placeholder
      return next();
    }

    return res.status(401).json({ error: "Unauthorized" });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/**
 * Extract userId from request (set by auth middleware)
 */
export function getUserId(req: Request): string {
  const userId = (req as any).userId;
  if (!userId) {
    throw new Error("User ID not found in request");
  }
  return userId;
}
