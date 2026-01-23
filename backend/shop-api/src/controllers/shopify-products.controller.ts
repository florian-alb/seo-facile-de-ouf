import { Request, Response } from "express";
import * as productsService from "../services/shopify-products.service";
import type { ProductFilters } from "@seo-facile-de-ouf/shared/src/shopify";

export async function getProducts(req: Request, res: Response) {
  try {
    const { shopId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Parse query params
    const filters: ProductFilters = {};
    if (req.query.collectionId) {
      filters.collectionId = req.query.collectionId as string;
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }
    if (req.query.status) {
      filters.status = req.query.status as "ACTIVE" | "DRAFT" | "ARCHIVED";
    }

    const products = await productsService.getProducts(shopId, userId, filters);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);

    if (error instanceof Error) {
      if (error.message === "Store not found") {
        return res.status(404).json({ error: "Store not found" });
      }
      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }
    }

    res.status(500).json({ error: "Failed to fetch products" });
  }
}

export async function syncProducts(req: Request, res: Response) {
  try {
    const { shopId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const response = await productsService.syncProducts(shopId, userId);
    res.json(response);
  } catch (error) {
    console.error("Error syncing products:", error);

    if (error instanceof Error) {
      if (error.message === "Store not found") {
        return res.status(404).json({ error: "Store not found" });
      }
      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }
    }

    res.status(500).json({ error: "Failed to sync products" });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const { shopId, productId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const product = await productsService.getProductById(
      shopId,
      productId,
      userId
    );
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);

    if (error instanceof Error) {
      if (
        error.message === "Store not found" ||
        error.message === "Product not found"
      ) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes("Unauthorized")) {
        return res.status(403).json({ error: error.message });
      }
    }

    res.status(500).json({ error: "Failed to fetch product" });
  }
}
