import { getAll } from "@app/services/generation.service";
import { IError } from "@app/types/error";
import { Router, Request, Response } from "express";

const router = Router();

// GET /users
router.get("/", async (_req: Request, res: Response) => {
  try {
    const generations = await getAll();
    res.json(generations);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.send({
        status: 500,
        message: error.message,
        url: "/generations",
      } as unknown as IError);
    } else {
      res.send({
        status: 500,
        message: "Unknown error",
        url: "/generations",
      } as unknown as IError);
    }
  }
});

export default router;
