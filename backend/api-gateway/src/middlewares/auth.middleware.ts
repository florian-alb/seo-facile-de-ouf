import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

const USERS_API_URL = process.env.USERS_API_URL || "http://localhost:5001";

/**
 * Session validation middleware
 * Calls users-api to validate the Better Auth session
 * and extracts user information
 */
export async function validateSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const headers: any = {
      "X-Gateway-Secret": process.env.GATEWAY_SECRET,
    };

    if (req.headers.cookie) {
      headers.Cookie = req.headers.cookie;
    }

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const url = `${USERS_API_URL}/auth/validate-session`;
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        `[Gateway] validate-session returned ${response.status}:`,
        data,
      );
    }

    if (data.authenticated && data.user) {
      req.user = data.user;
    } else {
      console.warn(
        `[Gateway] Session not authenticated for ${req.method} ${req.originalUrl}`,
        { status: response.status, hasCookie: !!req.headers.cookie, hasGatewaySecret: !!process.env.GATEWAY_SECRET },
      );
    }

    next();
  } catch (error) {
    console.error("[Gateway] Session validation error:", error);
    // Continue sans user - les routes protégées vérifieront
    next();
  }
}

/**
 * Middleware pour requérir l'authentification
 * Vérifie que req.user est défini (session valide)
 */
export function requireAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
    return;
  }
  next();
}
