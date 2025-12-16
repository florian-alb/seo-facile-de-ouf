import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.get("/me", authController.getMe);
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

export default router;
