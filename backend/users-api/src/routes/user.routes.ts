import { Router } from "express";
import * as usersController from "../controllers/users.controller";

const router = Router();

router.get("/", usersController.getAllUsers);

router.get("/:id", usersController.getUserById);

router.post("/", usersController.createUser);

router.post("/:id/generations", usersController.addGenerationToUser);

export default router;
