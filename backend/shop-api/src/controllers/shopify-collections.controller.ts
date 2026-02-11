import { Request, Response } from "express";
import * as collectionsService from "../services/shopify-collections.service";
import { getParam, handleServiceError } from "@seo-facile-de-ouf/backend-shared";

export async function getCollections(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const shopId = getParam(req, "shopId");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await collectionsService.getCollections(shopId, userId, page, limit);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, "Failed to fetch collections");
  }
}

export async function syncCollections(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const shopId = getParam(req, "shopId");

    const result = await collectionsService.syncCollections(shopId, userId);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, "Failed to sync collections");
  }
}

export async function getCollectionById(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const shopId = getParam(req, "shopId");
    const collectionId = getParam(req, "collectionId");

    const collection = await collectionsService.getCollectionById(shopId, collectionId, userId);

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.json(collection);
  } catch (error) {
    handleServiceError(res, error, "Failed to fetch collection");
  }
}

export async function updateCollection(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const shopId = getParam(req, "shopId");
    const collectionId = getParam(req, "collectionId");

    const result = await collectionsService.updateCollection(shopId, collectionId, userId, req.body);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, "Failed to update collection");
  }
}

export async function syncSingleCollection(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const shopId = getParam(req, "shopId");
    const collectionId = getParam(req, "collectionId");

    const result = await collectionsService.syncSingleCollection(shopId, collectionId, userId);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, "Failed to sync collection");
  }
}

export async function publishCollection(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const shopId = getParam(req, "shopId");
    const collectionId = getParam(req, "collectionId");

    const result = await collectionsService.publishCollectionToShopify(shopId, collectionId, userId, req.body);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, "Failed to publish collection");
  }
}
