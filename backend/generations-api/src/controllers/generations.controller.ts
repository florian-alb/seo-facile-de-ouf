import { Request, Response, NextFunction } from "express";
import * as generationsService from "../services/generation.service";

export async function getAllGenerations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId!; // Set by requireAuth middleware
    const generations = await generationsService.getAll(userId);
    res.json(generations);
  } catch (err) {
    next(err);
  }
}

export async function getGenerationById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.userId!; // Set by requireAuth middleware

    if (!id) {
      return res.status(400).json({ error: "id required" });
    }

    const generation = await generationsService.getById(id, userId);

    if (!generation) {
      return res.status(404).json({ error: "generation not found" });
    }

    res.json(generation);
  } catch (err) {
    next(err);
  }
}
