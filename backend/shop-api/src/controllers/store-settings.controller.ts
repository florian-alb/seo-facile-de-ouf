import { Request, Response, NextFunction } from "express";
import * as storeSettingsService from "../services/store-settings.service";

export async function getSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const storeId = Array.isArray(req.params.storeId)
      ? req.params.storeId[0]
      : req.params.storeId;

    const settings = await storeSettingsService.getSettings(storeId, userId);

    res.json(settings ?? null);
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const storeId = Array.isArray(req.params.storeId)
      ? req.params.storeId[0]
      : req.params.storeId;

    const settings = await storeSettingsService.upsertSettings(
      storeId,
      userId,
      req.body
    );

    res.json(settings);
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}
