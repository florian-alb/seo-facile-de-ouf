import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { gatewayGuard } from "@seo-facile-de-ouf/backend-shared";

const router = Router();

router.use(gatewayGuard)

router.get("/", usersController.getAllUsers);
router.get("/:id", usersController.getUserById);
router.post("/", usersController.createUser);
router.post("/:id/generations", usersController.addGenerationToUser);

export default router;
