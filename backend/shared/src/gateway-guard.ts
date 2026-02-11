import { Request, Response, NextFunction } from "express";

export interface GatewayAuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export function gatewayGuard(
  req: GatewayAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const gatewaySecret = req.headers["x-gateway-secret"];
  const expectedSecret = process.env.GATEWAY_SECRET;

  if (!expectedSecret) {
    console.error("[FATAL] GATEWAY_SECRET not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  if (!gatewaySecret || gatewaySecret !== expectedSecret) {
    console.warn(
      `[SECURITY] Direct access attempt blocked: ${req.ip} -> ${req.method} ${req.path}`,
    );
    return res.status(403).json({
      error: "Forbidden",
      message: "Direct access to this service is not allowed",
    });
  }

  const userId = req.headers["x-user-id"] as string | undefined;
  const userEmail = req.headers["x-user-email"] as string | undefined;
  const userName = req.headers["x-user-name"] as string | undefined;

  if (userId) {
    req.userId = userId;
    req.userEmail = userEmail;
    req.userName = userName;
  }

  next();
}

export function requireAuth(
  req: GatewayAuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.userId) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
    });
  }
  next();
}

export function getUserId(req: GatewayAuthenticatedRequest): string {
  const userId = req.userId;
  if (!userId) {
    throw new Error("User ID not found in request");
  }
  return userId;
}
