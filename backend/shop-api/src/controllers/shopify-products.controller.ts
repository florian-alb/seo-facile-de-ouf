import { Request, Response } from "express";
import * as productsService from "../services/shopify-products.service";
import { getParam, getRequiredUserId, handleServiceError } from "@seo-facile-de-ouf/backend-shared";
import type {
  ProductFilters,
  ProductUpdateInput,
} from "@seo-facile-de-ouf/shared/src/shopify-products";

export async function getProducts(req: Request, res: Response) {
  try {
    const shopId = getParam(req, "shopId");
    const userId = getRequiredUserId(req, res);
    if (!userId) return;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: ProductFilters = {};
    if (req.query.collectionId) filters.collectionId = req.query.collectionId as string;
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.status) filters.status = req.query.status as "ACTIVE" | "DRAFT" | "ARCHIVED";

    const result = await productsService.getProducts(shopId, userId, page, limit, filters);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, "Failed to fetch products");
  }
}

export async function syncProducts(req: Request, res: Response) {
  try {
    const shopId = getParam(req, "shopId");
    const userId = getRequiredUserId(req, res);
    if (!userId) return;

    const response = await productsService.syncProducts(shopId, userId);
    res.json(response);
  } catch (error) {
    handleServiceError(res, error, "Failed to sync products");
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const shopId = getParam(req, "shopId");
    const productId = getParam(req, "productId");
    const userId = getRequiredUserId(req, res);
    if (!userId) return;

    const product = await productsService.getProductById(shopId, productId, userId);
    res.json(product);
  } catch (error) {
    handleServiceError(res, error, "Failed to fetch product");
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const shopId = getParam(req, "shopId");
    const productId = getParam(req, "productId");
    const userId = getRequiredUserId(req, res);
    if (!userId) return;

    const updateData: ProductUpdateInput = req.body;
    const result = await productsService.updateProduct(shopId, productId, userId, updateData);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, "Failed to update product");
  }
}

export async function syncSingleProduct(req: Request, res: Response) {
  try {
    const shopId = getParam(req, "shopId");
    const productId = getParam(req, "productId");
    const userId = getRequiredUserId(req, res);
    if (!userId) return;

    const result = await productsService.syncSingleProduct(shopId, productId, userId);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, "Failed to sync product");
  }
}

export async function publishProduct(req: Request, res: Response) {
  try {
    const shopId = getParam(req, "shopId");
    const productId = getParam(req, "productId");
    const userId = getRequiredUserId(req, res);
    if (!userId) return;

    const updateData: ProductUpdateInput = req.body;
    const result = await productsService.publishProductToShopify(shopId, productId, userId, updateData);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error, "Failed to publish product");
  }
}
