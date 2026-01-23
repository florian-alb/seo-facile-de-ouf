import { Router, Request, Response } from "express";
import * as generationsController from "../controllers/generations.controller";
import { Generation } from "@app/models/generation.model";
import { publishJob } from "@app/lib/rabbitmq";

const router = Router();

router.get("/", generationsController.getAllGenerations);

router.get("/:id", generationsController.getGenerationById);


// ═══════════════════════════════════════════════════════════
// POST /generate - Créer un job de génération
// ═══════════════════════════════════════════════════════════
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { productId, productName, keywords, userId, shopId, type } = req.body;
    
    // Validation
    if (!productId || !productName || !userId || !shopId) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }
    
    // 1. Créer le job en base
    const generation = await Generation.create({
      productId,
      productName,
      keywords: keywords || [],
      userId,
      shopId,
      status: 'pending'
    });
    
    // 2. Publier dans RabbitMQ
    await publishJob({
      jobId: generation._id.toString(),
      type: type || 'meta_only'
    });
    
    // 3. Répondre immédiatement avec le jobId
    res.status(202).json({
      success: true,
      jobId: generation._id.toString(),
      status: 'pending',
      message: 'Generation queued successfully'
    });
    
  } catch (error) {
    console.error('Error creating generation:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
});

// ═══════════════════════════════════════════════════════════
// GET /job/:id - Récupérer le statut et résultat d'un job
// ═══════════════════════════════════════════════════════════
router.get('/job/:id', async (req: Request, res: Response) => {
  try {
    const generation = await Generation.findById(req.params.id);
    
    if (!generation) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json({
      jobId: generation._id.toString(),
      status: generation.status,
      content: generation.content,
      error: generation.error,
      createdAt: generation.createdAt,
      completedAt: generation.completedAt
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════
// POST /generate/bulk - Générer plusieurs produits
// ═══════════════════════════════════════════════════════════
router.post('/generate/bulk', async (req: Request, res: Response) => {
  try {
    const { products, userId, shopId, type } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array required' });
    }
    
    if (products.length > 50) {
      return res.status(400).json({ error: 'Max 50 products per batch' });
    }
    
    const jobs = await Promise.all(
      products.map(async (product) => {
        const generation = await Generation.create({
          productId: product.id,
          productName: product.name,
          keywords: product.keywords || [],
          userId,
          shopId,
          status: 'pending'
        });
        
        await publishJob({
          jobId: generation._id.toString(),
          type: type || 'meta_only'
        });
        
        return {
          productId: product.id,
          jobId: generation._id
        };
      })
    );
    
    res.status(202).json({
      success: true,
      count: jobs.length,
      jobs
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
 
// ═══════════════════════════════════════════════════════════
// GET /jobs - Lister les jobs d'un user/shop
// ═══════════════════════════════════════════════════════════
router.get('/jobs', async (req: Request, res: Response) => {
  const { userId, shopId, status, limit = 50 } = req.query;
  
  const filter: any = {};
  if (userId) filter.userId = userId;
  if (shopId) filter.shopId = shopId;
  if (status) filter.status = status;
  
  const jobs = await Generation
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .select('productId productName status createdAt completedAt');
  
  res.json({ jobs });
});


export default router;
