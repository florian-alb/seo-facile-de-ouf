import { Request, Response, NextFunction } from "express";
import * as collectionsService from "../services/shopify-collections.service";

export async function getCollections(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await collectionsService.getCollections(
      shopId,
      userId,
      page,
      limit
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function syncCollections(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
      
    const result = await collectionsService.syncCollections(shopId, userId);

    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

export async function getCollectionById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
    const collectionId = Array.isArray(req.params.collectionId)
      ? req.params.collectionId[0]
      : req.params.collectionId;

    const collection = await collectionsService.getCollectionById(
      shopId,
      collectionId,
      userId
    );

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json(collection);
  } catch (err) {
    next(err);
  }
}

export async function updateCollection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
    const collectionId = Array.isArray(req.params.collectionId)
      ? req.params.collectionId[0]
      : req.params.collectionId;

    const result = await collectionsService.updateCollection(
      shopId,
      collectionId,
      userId,
      req.body
    );

    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

export async function syncSingleCollection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
    const collectionId = Array.isArray(req.params.collectionId)
      ? req.params.collectionId[0]
      : req.params.collectionId;

    const result = await collectionsService.syncSingleCollection(
      shopId,
      collectionId,
      userId
    );

    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

export async function publishCollection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!;
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
    const collectionId = Array.isArray(req.params.collectionId)
      ? req.params.collectionId[0]
      : req.params.collectionId;

    const result = await collectionsService.publishCollectionToShopify(
      shopId,
      collectionId,
      userId,
      req.body
    );

    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    if (err instanceof Error && err.message.includes("Shopify error")) {
      return res.status(502).json({ error: err.message });
    }
    next(err);
  }
}
