import { Request, Response } from "express";

export function getParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}

export function getRequiredUserId(req: Request, res: Response): string | null {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return userId;
}

export function handleServiceError(res: Response, error: unknown, fallbackMessage: string) {
  console.error(`${fallbackMessage}:`, error);

  if (error instanceof Error) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes("Shopify error")) {
      return res.status(502).json({ error: error.message });
    }
  }

  res.status(500).json({ error: fallbackMessage });
}
