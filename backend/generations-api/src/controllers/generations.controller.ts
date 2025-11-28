import { Request, Response, NextFunction } from "express";
import * as generationsService from "../services/generation.service";

export async function getAllGenerations(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const generations = await generationsService.getAll();
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
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id required" });
    }

    const generation = await generationsService.getById(id);

    if (!generation) {
      return res.status(404).json({ error: "generation not found" });
    }

    res.json(generation);
  } catch (err) {
    next(err);
  }
}
