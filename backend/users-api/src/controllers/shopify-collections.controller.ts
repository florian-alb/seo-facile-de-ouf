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

    const collections = await collectionsService.getCollections(shopId, userId);
    res.json(collections);
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

    console.log("shopId", shopId)
    const result = await collectionsService.syncCollections(shopId, userId);
    console.log("result", result)


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
