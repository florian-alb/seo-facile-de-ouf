import { Request, Response, NextFunction } from "express";
import * as usersService from "../services/user.service";

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("req.body", req.body);
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "name and email required" });
    }

    const user = await usersService.createUser(name, email);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    const user = await usersService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function addGenerationToUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "invalid id" });
    }

    const { generationId } = req.body;

    if (!generationId) {
      return res.status(400).json({ error: "generationId required" });
    }

    const user = await usersService.addGenerationToUser(id, generationId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}
