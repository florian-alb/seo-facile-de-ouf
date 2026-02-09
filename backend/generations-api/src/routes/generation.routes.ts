import { Router, Request, Response } from "express";
import * as generationsController from "../controllers/generations.controller";
import { Generation } from "@app/models/generation.model";
import { publishJob } from "@app/lib/rabbitmq";
import { gatewayGuard, requireAuth, type GatewayAuthenticatedRequest } from "../middlewares/gateway-guard";

const router = Router();

// Apply gateway guard to all routes (verify requests come from gateway)
router.use(gatewayGuard);

// Apply authentication requirement to all generation routes
router.use(requireAuth);

router.get("/", generationsController.getAllGenerations);

router.get("/product/:productId", generationsController.getGenerationsByProductId);
router.get("/collection/:collectionId", generationsController.getGenerationsByCollectionId);

router.get("/:id", generationsController.getGenerationById);

// ═══════════════════════════════════════════════════════════
// POST /generate - Créer un job de génération
// ═══════════════════════════════════════════════════════════
router.post("/generate", async (req: GatewayAuthenticatedRequest, res: Response) => {
  try {
    const {
      productId, productName, keywords, shopId, fieldType,
      storeSettings, productContext,
      entityType, collectionId, collectionName, collectionContext,
    } = req.body;
    const userId = req.userId;

    const resolvedEntityType = entityType || "product";

    // Validation conditionnelle selon le type d'entite
    if (resolvedEntityType === "product" && (!productId || !productName || !shopId)) {
      return res.status(400).json({
        error: "Missing required fields: productId, productName, shopId",
      });
    }
    if (resolvedEntityType === "collection" && (!collectionId || !collectionName || !shopId)) {
      return res.status(400).json({
        error: "Missing required fields: collectionId, collectionName, shopId",
      });
    }

    // 1. Créer le job en base
    const generation = await Generation.create({
      entityType: resolvedEntityType,
      productId: productId || undefined,
      productName: productName || undefined,
      collectionId: collectionId || undefined,
      collectionName: collectionName || undefined,
      keywords: keywords || [],
      userId,
      shopId,
      fieldType: fieldType || "full_description",
      storeSettings: storeSettings || undefined,
      productContext: productContext || undefined,
      collectionContext: collectionContext || undefined,
      status: "pending",
    });

    // 2. Publier dans RabbitMQ
    await publishJob({
      jobId: generation._id.toString(),
      type: fieldType || "full_description",
      entityType: resolvedEntityType,
    });

    // 3. Répondre immédiatement avec le jobId
    res.status(202).json({
      success: true,
      jobId: generation._id.toString(),
      status: "pending",
      message: "Generation queued successfully",
    });
  } catch (error) {
    console.error("Error creating generation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /job/:id/stream - SSE stream pour suivre un job en temps réel
// ═══════════════════════════════════════════════════════════
router.get("/job/:id/stream", async (req: Request, res: Response) => {
  try {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    const sendEvent = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial state
    sendEvent({
      jobId: generation._id.toString(),
      status: generation.status,
      content: generation.content,
      error: generation.error,
    });

    // If already terminal, close immediately
    if (generation.status === "completed" || generation.status === "failed") {
      res.end();
      return;
    }

    // Open MongoDB Change Stream to watch this document
    const changeStream = Generation.watch(
      [{ $match: { "documentKey._id": generation._id } }],
      { fullDocument: "updateLookup" },
    );

    changeStream.on("change", (change) => {
      const doc = change.fullDocument;
      if (!doc) return;

      sendEvent({
        jobId: doc._id.toString(),
        status: doc.status,
        content: doc.content,
        error: doc.error,
      });

      // Close stream on terminal status
      if (doc.status === "completed" || doc.status === "failed") {
        changeStream.close();
        res.end();
      }
    });

    changeStream.on("error", (error) => {
      console.error("Change stream error:", error);
      changeStream.close();
      res.end();
    });

    // Cleanup when client disconnects
    req.on("close", () => {
      changeStream.close();
    });
  } catch (error) {
    console.error("SSE stream error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /job/:id - Récupérer le statut et résultat d'un job
// ═══════════════════════════════════════════════════════════
router.get("/job/:id", async (req: Request, res: Response) => {
  try {
    const generation = await Generation.findById(req.params.id);

    if (!generation) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      jobId: generation._id.toString(),
      status: generation.status,
      content: generation.content,
      error: generation.error,
      createdAt: generation.createdAt,
      completedAt: generation.completedAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /generate/bulk - Générer plusieurs produits
// ═══════════════════════════════════════════════════════════
router.post("/generate/bulk", async (req: Request, res: Response) => {
  try {
    const { products, userId, shopId, type } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Products array required" });
    }

    if (products.length > 50) {
      return res.status(400).json({ error: "Max 50 products per batch" });
    }

    const jobs = await Promise.all(
      products.map(async (product) => {
        const generation = await Generation.create({
          productId: product.id,
          productName: product.name,
          keywords: product.keywords || [],
          userId,
          shopId,
          status: "pending",
        });

        await publishJob({
          jobId: generation._id.toString(),
          type: type || "full_description",
        });

        return {
          productId: product.id,
          jobId: generation._id,
        };
      }),
    );

    res.status(202).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /jobs - Lister les jobs d'un user/shop
// ═══════════════════════════════════════════════════════════
router.get("/jobs", async (req: Request, res: Response) => {
  const { userId, shopId, status, limit = 50 } = req.query;

  const filter: any = {};
  if (userId) filter.userId = userId;
  if (shopId) filter.shopId = shopId;
  if (status) filter.status = status;

  const jobs = await Generation.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select("entityType productId productName collectionId collectionName status createdAt completedAt");

  res.json({ jobs });
});

export default router;
