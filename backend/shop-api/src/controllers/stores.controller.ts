import { Request, Response, NextFunction } from "express";
import * as storeService from "../services/store.service";

export async function getAllStores(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const stores = await storeService.getStoresByUserId(userId);
    res.json(stores);
  } catch (err) {
    next(err);
  }
}

export async function getStoreById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const storeId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const store = await storeService.getStoreById(storeId, userId);

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(store);
  } catch (err) {
    next(err);
  }
}

export async function createStore(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const { name, url, shopifyDomain, language } = req.body;

    if (!name || !url || !shopifyDomain || !language) {
      return res.status(400).json({
        error:
          "Missing required fields: name, url, shopifyDomain, language",
      });
    }

    const result = await storeService.createStore(userId, {
      name,
      url,
      shopifyDomain,
      language,
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateStore(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const storeId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const { name, url, language } = req.body;

    const store = await storeService.updateStore(storeId, userId, {
      name,
      url,
      language,
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(store);
  } catch (err) {
    next(err);
  }
}

export async function reconnectStore(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const storeId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const result = await storeService.initiateReconnect(storeId, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteStore(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId!;
    const storeId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const deleted = await storeService.deleteStore(storeId, userId);

    if (!deleted) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
