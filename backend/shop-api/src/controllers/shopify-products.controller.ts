import { Request, Response } from "express";
import * as productsService from "../services/shopify-products.service";
import type {
  ProductFilters,
  ProductUpdateInput,
} from "@seo-facile-de-ouf/shared/src/shopify-products";

export async function getProducts(req: Request, res: Response) {
  try {
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Parse pagination params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Parse filter params
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

    const result = await productsService.getProducts(
      shopId,
      userId,
      page,
      limit,
      filters,
    );
    res.json(result);
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
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
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
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;
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

export async function updateProduct(req: Request, res: Response) {
  try {
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updateData: ProductUpdateInput = req.body;

    const result = await productsService.updateProduct(
      shopId,
      productId,
      userId,
      updateData
    );
    res.json(result);
  } catch (error) {
    console.error("Error updating product:", error);

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

    res.status(500).json({ error: "Failed to update product" });
  }
}

export async function publishProduct(req: Request, res: Response) {
  try {
    const shopId = Array.isArray(req.params.shopId)
      ? req.params.shopId[0]
      : req.params.shopId;
    const productId = Array.isArray(req.params.productId)
      ? req.params.productId[0]
      : req.params.productId;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updateData: ProductUpdateInput = req.body;

    const result = await productsService.publishProductToShopify(
      shopId,
      productId,
      userId,
      updateData
    );
    res.json(result);
  } catch (error) {
    console.error("Error publishing product:", error);

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
      if (error.message.includes("Shopify error")) {
        return res.status(502).json({ error: error.message });
      }
    }

    res.status(500).json({ error: "Failed to publish product" });
  }
}
