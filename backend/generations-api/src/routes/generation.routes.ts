import { Router } from "express";
import * as generationsController from "../controllers/generations.controller";

const router = Router();

router.get("/", generationsController.getAllGenerations);

router.get("/:id", generationsController.getGenerationById);

export default router;
